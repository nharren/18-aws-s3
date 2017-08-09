'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('authentication-server:authentication-router');
const basicAuthentication = require('../middleware/basic-authentication.js');
const User = require('../model/user.js');
const createError = require('http-errors');

const authenticationRouter = Router();

authenticationRouter.post('/api/signup', jsonParser, function(request, response, next) {
  debug('POST: /api/signup');

  if (Object.keys(request.body).length == 0) {
    let error = createError(400, 'no request body provided');
    return next(error);
  }

  let password = request.body.password;
  delete request.body.password;

  let user = new User(request.body);
  user.generatePasswordHash(password)
    .then(user => user.save())
    .then(user => user.generateToken())
    .then(token => response.send(token))
    .catch(next);
});

authenticationRouter.get('/api/signin', basicAuthentication, function(request, response, next) {
  debug('GET: /api/signin');

  User.findOne({ username: request.authorization.username })
    .then(user => {
      if (!user) {
        let error = createError(401, 'user not authorized');
        return Promise.reject(error);
      }

      return user.comparePasswordHash(request.authorization.password);
    })
    .then(user => user.generateToken())
    .then(token => response.send(token))
    .catch(next);
});

module.exports = authenticationRouter;