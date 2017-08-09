'use strict';

const createError = require('http-errors');
const debug = require('debug')('authentication-server:basic-authentication');

let basicAuthentication = function(request, response, next) {
  debug('basicAuthentication');

  let authorization = request.headers.authorization;

  if (!authorization) {
    let error = createError(401, 'Authorization header not provided.');
    return next(error);
  }

  let base64CredentialArray = authorization.split('Basic ');

  if (base64CredentialArray.length < 2) {
    let error = createError(401, 'Invalid authorization header format.');
    return next(error);
  }

  let base64Credentials = base64CredentialArray[1];

  if (!base64Credentials) {
    let error = createError(401, 'Authorization header credentials not provided.');
    return next(error);
  }

  let base64CredentialBuffer = Buffer.from(base64Credentials, 'base64');
  let credentials = base64CredentialBuffer.toString();

  if (!credentials) {
    let error = createError(401, 'Authorization header credentials not provided.');
    return next(error);
  }

  let credentialArray = credentials.split(':');

  if (credentialArray.length < 2) {
    let error = createError(401, 'Invalid credential format.');
    return next(error);
  }

  let username = credentialArray[0];
  let password = credentialArray[1];

  if (!username) {
    let error = createError(401, 'Invalid username.');
    return next(error);
  }

  if (!password) {
    let error = createError(401, 'Password not provided.');
    return next(error);
  }

  request.authorization = {
    username: username,
    password: password
  };

  next();
};

module.exports = basicAuthentication;