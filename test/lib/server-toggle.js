'use strict';

const debug = require('debug')('cf-rolodex:server-toggle');

module.exports = exports = {};

exports.serverOn = function(server, done) {
  if (!server.isRunning) {
    server.listen(process.env.PORT, () => {
      server.isRunning = true;
      debug('server up!');
      done();
    });
    return;
  }
  
  done();
};

exports.serverOff = function(server, done) {
  if (server.isRunning) {
    server.close(error => {
      if (error) return error;
      server.isRunning = false;
      debug('server down!');
      done();
    });

    return;
  }

  done();
};
