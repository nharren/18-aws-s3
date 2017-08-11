'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');

const server = require('../server.js');
const serverToggle = require('./lib/server-toggle.js');

const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

describe('Authentication Routes', function() {
  before(done => {
    serverToggle.serverOn(server, done);
  });

  after(done => {
    serverToggle.serverOff(server, done);
  });

  describe('unregistered routes', function() {

    it('should return a 404 error', done => {
      request.get(`${url}/api/fakesignin`)
        .auth('exampleuser', '1234')
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
  });

  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {

      after(done => {
        User.remove({})
          .then(() => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
          .send(exampleUser)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            expect(response.status).to.equal(200);
            expect(response.text).to.be.a('string');
            done();
          });
      });

    });

    describe('with no body', function() {

      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
          .send()
          .end((error, response) => {
            expect(response.status).to.equal(400);
            done();
          });
      });

    });
  });

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {

      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
          .then(user => user.save())
          .then(user => {
            this.tempUser = user;
            done();
          })
          .catch(done);
      });

      after(done => {
        User.remove({})
          .then(() => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
          .auth('exampleuser', '1234')
          .end((error, response) => {
            expect(response.status).to.equal(200);
            done();
          });
      });

    });

    describe('with an unauthorized user', function() {

      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
          .auth('fakeuser', '4321')
          .end((error, response) => {
            expect(response.status).to.equal(401);
            done();
          });
      });

    });
  });
});