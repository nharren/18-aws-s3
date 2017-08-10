'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('cf-rolodex:picture-router-test');
const fs = require('fs');
const AWS = require('aws-sdk');

const Picture = require('../model/picture.js');
const Contact = require('../model/contact.js');
const User = require('../model/user.js');

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

const imagePath = `${__dirname}/test-data/profile_default.png`;
const testImagePath = `${__dirname}/../data/test-image.png`;

const testPicture = {
  name: 'g',
  description: 'h',
  image: testImagePath
};
  
function s3Upload(params) {
  return new Promise(resolve => {
    s3.upload(params, (error, s3Data) => {
      resolve(s3Data);
    });
  });
}

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

      before(done => {
        let user = new User(testUser);
        user.generatePasswordHash(testUser.password)
          .then(user => user.save())
          .then(user => {
            this.user = user;
            return user.generateToken();
          })
          .then(token => {
            this.token = token;
            done();
          })
          .catch(done);
      });

      before(done => {
        testContact.userId = this.user._id.toString();
        Contact.create(testContact)
          .then(contact => {
            this.contact = contact;
            done();
          })
          .catch(done);
      });

      before(done => {
        fs.link(imagePath, testImagePath, () => {
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

      before(done => {
        let user = new User(testUser);
        user.generatePasswordHash(testUser.password)
          .then(user => user.save())
          .then(user => {
            this.user = user;
            return user.generateToken();
          })
          .then(token => {
            this.token = token;
            done();
          })
          .catch(done);
      });

      before(done => {
        testContact.userId = this.user._id.toString();
        Contact.create(testContact)
          .then(contact => {
            this.contact = contact;
            done();
          })
          .catch(done);
      });

      before(done => {
        fs.link(imagePath, testImagePath, () => {
          testPicture.userId = this.user._id.toString();
          testPicture.contactId = this.contact._id.toString();

          let params = {
            ACL: 'public-read',
            Bucket: process.env.AWS_BUCKET,
            Key: 'test-image.png',
            Body: fs.createReadStream(`${__dirname}/../data/test-image.png`)
          };

          s3Upload(params)
            .then(s3Data => {
              testPicture.imageURI = s3Data.Location;
              testPicture.objectKey = s3Data.Key;
              return Picture.create(testPicture);
            })
            .then(picture => {
              this.picture = picture;
              done();
            })
            .catch(done);
        });
      });


      after(done => {
        let params = {
          Bucket: process.env.AWS_BUCKET,
          Key: 'test-image.png'
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

      before(done => {
        let user = new User(testUser);
        user.generatePasswordHash(testUser.password)
          .then(user => user.save())
          .then(user => {
            this.user = user;
            return user.generateToken();
          })
          .then(token => {
            this.token = token;
            done();
          })
          .catch(done);
      });

      before(done => {
        testContact.userId = this.user._id.toString();
        Contact.create(testContact)
          .then(contact => {
            this.contact = contact;
            done();
          })
          .catch(done);
      });

      before(done => {
        fs.link(imagePath, testImagePath, () => {
          testPicture.userId = this.user._id.toString();
          testPicture.contactId = this.contact._id.toString();

          let params = {
            ACL: 'public-read',
            Bucket: process.env.AWS_BUCKET,
            Key: 'test-image.png',
            Body: fs.createReadStream(`${__dirname}/../data/test-image.png`)
          };

          s3Upload(params)
            .then(s3Data => {
              testPicture.imageURI = s3Data.Location;
              testPicture.objectKey = s3Data.Key;
              return Picture.create(testPicture);
            })
            .then(picture => {
              this.picture = picture;
              done();
            })
            .catch(done);
        });
      });


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