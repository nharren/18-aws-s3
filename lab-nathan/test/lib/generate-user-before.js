'use strict';

const debug = require('debug')('cf-rolodex:picture-router-test');
const User = require('../../model/user.js');

let generateUserBefore = function(context, userData) {
  debug('generateUserBefore');
  
  return done => {
    User.createAuthenticated(userData, (error, user, token) => {
      if (error) {
        return done(error);
      }

      context.user = user;
      context.token = token;
      done();
    });
  };
};

module.exports = generateUserBefore;