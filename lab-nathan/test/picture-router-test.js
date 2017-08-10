'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('cf-rolodex:picture-router-test');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
const path = require('path');

const Picture = require('../model/picture.js');
const Contact = require('../model/contact.js');
const User = require('../model/user.js');

const generateUserBefore = require('./lib/generate-user-before.js');
const generateContactBefore = require('./lib/generate-contact-before.js');
const generatePictureBefore = require('./lib/generate-picture-before.js');

const s3 = new AWS.S3();

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'a',
  password: 'b',
  email: 'c',
};

const testContact = {
  name: 'd',
  email: 'e',
  phone: 'f'
};

const testImagePath = `${__dirname}/../data/${uuidv4()}.png`;

const testPicture = {
  name: 'g',
  description: 'h',
  image: testImagePath
};

describe('Picture Routes', function() {
  afterEach(done => {
    Promise.all([
      Picture.remove({}),
      User.remove({}),
      Contact.remove({})
    ])
      .then(() => done())
      .catch(done);
  });

  describe('POST: /api/contact/:contactId/picture', function() {
    describe('with a valid token and valid data', function() {
      debug('POST: /api/contact/:contactId/picture');

      before(generateUserBefore(this, testUser));
      before(generateContactBefore(this, testContact));

      before(done => {
        fs.link(`${__dirname}/data/profile_default.png`, testImagePath, () => {
          done();
        });
      });

      after(done => {
        delete testContact.userId;
        done();
      });

      it('should return a picture', done => {
        request.post(`${url}/api/contact/${this.contact._id}/picture`)
          .set({
            Authorization: `Bearer ${this.token}`
          })
          .field('name', testPicture.name)
          .field('description', testPicture.description)
          .attach('image', testPicture.image)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            expect(response.status).to.equal(200);
            expect(response.body.name).to.equal(testPicture.name);
            expect(response.body.description).to.equal(testPicture.description);
            expect(response.body.contactId).to.equal(this.contact._id.toString());
            done();
          });
      });
    });
  });

  describe('GET: /api/contact/:contactId/picture/:pictureId', function() {
    describe('with a valid token and valid data', function() {
      debug('GET: /api/contact/:contactId/picture/:pictureId');

      before(generateUserBefore(this, testUser));
      before(generateContactBefore(this, testContact));
      before(generatePictureBefore(this, testPicture));

      after(done => {
        let parsedFile = path.parse(testPicture.image);
        let filename = parsedFile.base;

        let params = {
          Bucket: process.env.AWS_BUCKET,
          Key: filename
        };

        s3.deleteObject(params, function(error) {
          if (!error) {
            return done(error);
          }

          delete testContact.userId;
          delete testPicture.userId;
          delete testPicture.contactId;
          delete testPicture.imageURI;
          delete testPicture.objectKey;
          done();
        });
      });

      it('should return a picture', done => {
        request.get(`${url}/api/contact/${this.contact._id}/picture/${this.picture._id}`)
          .set({
            Authorization: `Bearer ${this.token}`
          })
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            expect(response.status).to.equal(200);
            expect(response.body.name).to.equal(testPicture.name);
            expect(response.body.description).to.equal(testPicture.description);
            expect(response.body.contactId).to.equal(this.contact._id.toString());
            done();
          });
      });
    });
  });

  describe('DELETE: /api/contact/:contactId/picture/:pictureId', function() {
    describe('with a valid token and valid id', function() {
      debug('deletes a picture');

      before(generateUserBefore(this, testUser));
      before(generateContactBefore(this, testContact));
      before(generatePictureBefore(this, testPicture));

      after(done => {
        delete testContact.userId;
        delete testPicture.userId;
        delete testPicture.contactId;
        delete testPicture.imageURI;
        delete testPicture.objectKey;
        done();
      });

      it('should delete a picture', done => {
        request.delete(`${url}/api/contact/${this.contact._id}/picture/${this.picture._id}`)
          .set({
            Authorization: `Bearer ${this.token}`
          })
          .end((error, response) => {
            if (error) {
              return done(error);
            }

            expect(response.status).to.equal(204);
            done();
          });
      });
    });
  });
});