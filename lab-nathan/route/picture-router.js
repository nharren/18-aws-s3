'use strict';

const Router = require('express').Router;
const bearerAuthentication = require('../middleware/bearer-authentication.js');
const AWS = require('aws-sdk');
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const del = require('del');
const debug = require('debug')('cf-rolodex:picture-router');
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
  debug('POST: /api/contact/:contactId/picture');

  if (!request.file) {
    let error = createError(404, 'file not found');
    return next(error);
  }

  if (!request.file.path) {
    let error = createError(500, 'file not saved');
    return next(error);
  }

  let ext = path.extname(request.file.originalname);

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
        contactId: request.params.contactId,
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

pictureRouter.get('/api/contact/:contactId/picture/:pictureId', bearerAuthentication, function(request, response, next) {
  debug('GET: /api/contact/:contactId/picture/:pictureId');

  Picture.findById(request.params.pictureId)
    .then(picture => {
      response.json(picture);
      next();
    })
    .catch(error => {
      next(error);
    });
});
  
pictureRouter.delete('/api/contact/:contactId/picture/:pictureId', bearerAuthentication, function(request, response, next) {
  debug('DELETE: /api/contact/:contactId/picture/:pictureId');

  Picture.findById(request.params.pictureId)
    .then(picture => {
      return new Promise((resolve, reject) => {
        let params = {
          Bucket: process.env.AWS_BUCKET,
          Key: picture.objectKey
        };

        s3.deleteObject(params, function(error) {
          if (error) {
            reject(error);
          }
          
          response.sendStatus(204);
        });
      });
    })
    .then(picture => {
      return picture.remove();
    })
    .catch(next);
});

module.exports = pictureRouter;