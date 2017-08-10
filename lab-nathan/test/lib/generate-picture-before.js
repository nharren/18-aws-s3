'use strict';

const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const Picture = require('../../model/picture.js');

const s3 = new AWS.S3();

let generatePictureBefore = function(context, pictureData) {
  return done => {
    fs.link(`${__dirname}/../data/profile_default.png`, pictureData.image, () => {
      pictureData.userId = context.user._id.toString();
      pictureData.contactId = context.contact._id.toString();
      let parsedFile = path.parse(pictureData.image);
      let filename = parsedFile.base;

      let params = {
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET,
        Key: filename,
        Body: fs.createReadStream(pictureData.image)
      };

      s3Upload(params)
        .then(s3Data => {
          pictureData.imageURI = s3Data.Location;
          pictureData.objectKey = s3Data.Key;
          return Picture.create(pictureData);
        })
        .then(picture => {
          context.picture = picture;
          done();
        })
        .catch(done);
    });
  };
};

function s3Upload(params) {
  return new Promise(resolve => {
    s3.upload(params, (error, s3Data) => {
      resolve(s3Data);
    });
  });
}

module.exports = generatePictureBefore;