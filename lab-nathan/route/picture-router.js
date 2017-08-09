'use strict';

const Router = require('express').Router;
const bearerAuthentication = require('../middleware/bearer-authentication.js');
const AWS = require('aws-sdk');
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const del = require('del');
const Contact = require('../model/contact.js');
const Picture = require('../model/picture.js');

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

function s3Upload(params) {
  return new Promise(resolve => {
    s3.upload(params, (error, s3Data) => {
      resolve(s3Data);
    });
  });
}

const pictureRouter = new Router();

pictureRouter.post('/api/contact/:contactId/picture', bearerAuthentication, upload.single('image'), function(request, response, next) {
  if (!request.file) {
    let error = createError(404, 'file not found');
    return next(error);
  }

  if (!request.file.path) {
    let error = createError(500, 'file not saved');
    return next(error);
  }

  let ext = path.extname(request.file.originalName);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${request.file.filename}${ext}`,
    Body: fs.createReadStream(request.file.path)
  };

  Contact.findById(request.params.id)
    .then(() => {
      return s3Upload(params);
    })
    .then(s3Data => {
      del([`${dataDir}/*`]);

      let pictureData = {
        name: request.body.name,
        description: request.body.description,
        userId: request.user._id,
        contactId: request.params.id,
        imageURI: s3Data.Location,
        objectKey: s3Data.Key
      };

      return Picture.create(pictureData);
    })
    .then(picture => {
      response.json(picture);
    })
    .catch(error => {
      next(error);
    });
});

module.exports = pictureRouter;