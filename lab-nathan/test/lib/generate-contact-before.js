'use strict';

const Contact = require('../../model/contact.js');

let generateContactBefore = function(context, contactData) {
  return done => {
    contactData.userId = context.user._id.toString();
    Contact.create(contactData)
      .then(contact => {
        context.contact = contact;
        done();
      })
      .catch(done);
  };
};

module.exports = generateContactBefore;