'use strict';

const createError = require('http-errors');
const debug = require('debug')('cf-rolodex:errors');

const errors = function(error, request, response, next) {
  if (!next) {
    error = createError(404, error.message);
  }

  if (error.name === 'ValidationError') {
    error = createError(400, error.message);
  }
  
  if (!error.status) {
    error = createError(500, error.message);
  }

  debug('error name: ' + error.name);
  debug('error message: ' + error.message);

  response.status(error.status).send(error.name);
  next();
};

module.exports = errors;