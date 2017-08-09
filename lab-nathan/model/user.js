'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const debug = require('debug')('authentication-server:user');

const Schema = mongoose.Schema;

const userSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  findHash: { type: String, unique: true }
});

userSchema.methods.generatePasswordHash = function(password) {
  debug('generatePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (error, hash) => {
      if (error) return reject(error);
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(password) {
  debug('comparePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (error, valid) => {
      if (error) return reject(error);
      if (!valid) return reject(createError(401, 'invalid password'));
      resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function() {
  debug('generateFindHash');

  return new Promise((resolve, reject) => {
    let tries = 0;
    _generateFindHash.call(this);

    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
        .then(() => {
          return resolve(this.findHash);
        })
        .catch(error => {
          if (tries > 3) {
            return reject(error);
          }

          tries++;
          _generateFindHash.call(this);
        });
    }
  });
};

userSchema.methods.generateToken = function() {
  debug('generateToken');

  return new Promise((resolve, reject) => {
    this.generateFindHash()
      .then(findHash => resolve(jwt.sign({ token: findHash }, process.env.APP_SECRET)))
      .catch(error => reject(error));
  });
};

module.exports = mongoose.model('user', userSchema);