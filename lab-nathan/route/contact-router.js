'use strict';

const Router = require('express').Router;
const debug = require('debug')('authentication-server:contact-router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const bearerAuthentication = require('../middleware/bearer-authentication.js');
const Contact = require('../model/contact.js');

const contactRouter = new Router();

contactRouter.post('/api/contact', bearerAuthentication, jsonParser, function(request, response, next) {
  debug('POST: /api/contact');

  if (Object.keys(request.body).length === 0) {
    let error = createError(400, 'body not provided');
    return next(error);
  }

  request.body.userId = request.user._id;

  Contact.create(request.body)
    .then(contact => {
      response.json(contact);
    })
    .catch(error => {
      error = createError(400, error.message);
      next(error);
    }); 
});

contactRouter.get('/api/contact', bearerAuthentication, function(request, response, next) {
  debug('GET: /api/contact');

  Contact.find({})
    .then(contacts => {
      response.json(contacts);
    })
    .catch(error => {
      next(error);
    });
});

contactRouter.get('/api/contact/:id', bearerAuthentication, function(request, response, next) {
  debug('GET: /api/contact/:id');

  Contact.findById(request.params.id)
    .then(contact => {
      if (!contact) {
        let error = createError(404, 'contact not found');
        return next(error);
      }

      response.json(contact);
    })
    .catch(error => {
      error = createError(404, error.message);
      next(error);
    });
});

contactRouter.put('/api/contact/:id', bearerAuthentication, jsonParser, function(request, response, next) {
  debug('PUT: /api/contact/:id');

  if (Object.keys(request.body).length === 0) {
    let error = createError(400, 'body not provided');
    return next(error);
  }

  Contact.findByIdAndUpdate(request.params.id, request.body, { new: true })
    .then(contact => {
      if (!contact) {
        let error = createError(404, 'contact not found');
        return next(error);
      }

      response.json(contact);
    })
    .catch(error => {
      error = createError(404, error.message);
      next(error);
    });
});


contactRouter.delete('/api/contact/:id', bearerAuthentication, function(request, response, next) {
  debug('DELETE: /api/contact/:id');

  Contact.findByIdAndRemove(request.params.id)
    .then(() => {
      response.sendStatus(204);
    })
    .catch(error => {
      error = createError(404, error.message);
      next(error);
    });
});

module.exports = contactRouter;