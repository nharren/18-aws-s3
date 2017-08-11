'use strict';

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const debug = require('debug')('cf-rolodex:server');
const errors = require('./middleware/errors.js');
const authenticationRouter = require('./route/authentication-router.js');
const contactRouter = require('./route/contact-router.js');
const pictureRouter = require('./route/picture-router.js');

const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(authenticationRouter);
app.use(contactRouter);
app.use(pictureRouter);
app.use(errors);

const server = module.exports = app.listen(process.env.PORT, function() {
  debug(`Listening on port ${process.env.PORT}.`);
});

server.isRunning = true;