'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('contact', contactSchema);