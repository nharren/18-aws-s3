'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pictureSchema = Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  contactId: { type: Schema.Types.ObjectId, required: true },
  imageURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now }
});


module.exports = mongoose.model('picture', pictureSchema);