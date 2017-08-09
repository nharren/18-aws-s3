'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const Contact = require('../model/contact.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'a',
  password: 'b',
  email: 'c',
};

const testContact = {
  name: 'd',
  email: 'e',
  phone: 'f'
};

const updatedContact = {
  name: 'g',
  email: 'h',
  phone: 'i'
};

describe('Contact Router', function() {
  afterEach(done => {
    Promise.all([
      Contact.remove({}),
      User.remove({})     
    ])
      .then(() => {
        done();
      });
  });

  describe('POST: /api/contact', () => {
    before(done => {
      let user = new User(testUser);
      user.generatePasswordHash(testUser.password)
        .then(user => user.save())
        .then(user => {
          this.user = user;
          return user.generateToken();
        })
        .then(token => {
          this.token = token;
          done();
        })
        .catch(done);
    });

    it('should return a contact', done => {
      request.post(`${url}/api/contact`)
        .send(testContact)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal(testContact.name);
          expect(response.body.email).to.equal(testContact.email);
          expect(response.body.phone).to.equal(testContact.phone);
          expect(response.body.userId).to.equal(this.user._id.toString());
          done();
        });
    });

    it('should return unauthorized if no token provided.', done => {
      request.post(`${url}/api/contact`)
        .send(testContact)
        .end((error, response) => {
          expect(response.status).to.equal(401);
          done();
        });
    });

    it('should return bad request if sent invalid body.', done => {
      request.post(`${url}/api/contact`)
        .send()
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .end((error, response) => {
          expect(response.status).to.equal(400);
          done();
        });
    });
  });

  describe('GET: /api/contact/:id', () => {
    before(done => {
      let user = new User(testUser);
      user.generatePasswordHash(testUser.password)
        .then(user => user.save())
        .then(user => {
          this.user = user;
          return user.generateToken();
        })
        .then(token => {
          this.token = token;
          done();
        })
        .catch(done);
    });

    before(done => {
      testContact.userId = this.user._id.toString();
      Contact.create(testContact)
        .then(contact => {
          this.contact = contact;
          done();
        })
        .catch(done);
    });

    after(() => {
      delete this.contact.userId;
    });

    it('should return an array of contacts', done => {
      request.get(`${url}/api/contact`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('array');
          done();
        });
    });
  });

  describe('GET: /api/contact/:id', () => {
    before(done => {
      let user = new User(testUser);
      user.generatePasswordHash(testUser.password)
        .then(user => user.save())
        .then(user => {
          this.user = user;
          return user.generateToken();
        })
        .then(token => {
          this.token = token;
          done();
        })
        .catch(done);
    });

    before(done => {
      testContact.userId = this.user._id.toString();
      Contact.create(testContact)
        .then(contact => {
          this.contact = contact;
          done();
        })
        .catch(done);
    });

    after(() => {
      delete this.contact.userId;
    });

    it('should return a contact', done => {
      request.get(`${url}/api/contact/${this.contact._id}`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response.status).to.equal(200);
          expect(response.body.name).to.equal(testContact.name);
          expect(response.body.email).to.equal(testContact.email);
          expect(response.body.phone).to.equal(testContact.phone);
          expect(response.body.userId).to.equal(this.user._id.toString());
          done();
        });
    });

    it('should return unauthorized if no token provided.', done => {
      request.get(`${url}/api/contact/${this.contact._id}`)
        .end((error, response) => {
          expect(response.status).to.equal(401);
          done();
        });
    });

    it('should return not found if contact not found with supplied id.', done => {
      request.get(`${url}/api/contact/12345`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
  });

  describe('PUT: /api/contact/:id', () => {
    before(done => {
      let user = new User(testUser);
      user.generatePasswordHash(testUser.password)
        .then(user => user.save())
        .then(user => {
          this.user = user;
          return user.generateToken();
        })
        .then(token => {
          this.token = token;
          done();
        })
        .catch(done);
    });

    before(done => {
      testContact.userId = this.user._id.toString();
      Contact.create(testContact)
        .then(contact => {
          this.contact = contact;
          done();
        })
        .catch(done);
    });

    after(() => {
      delete this.contact.userId;
    });

    it('should return an updated contact', done => {
      request.put(`${url}/api/contact/${this.contact._id}`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .send(updatedContact)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response.body.name).to.equal(updatedContact.name);
          expect(response.body.email).to.equal(updatedContact.email);
          expect(response.body.phone).to.equal(updatedContact.phone);
          expect(response.body.userId).to.equal(this.user._id.toString());
          done();
        });
    });

    it('should return unauthorized if no token provided.', done => {
      request.put(`${url}/api/contact/${this.contact._id}`)
        .send(updatedContact)
        .end((error, response) => {
          expect(response.status).to.equal(401);
          done();
        });
    });

    it('should return bad request if sent invalid body.', done => {
      request.put(`${url}/api/contact/${this.contact._id}`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .send()
        .end((error, response) => {
          expect(response.status).to.equal(400);
          done();
        });
    });

    it('should return not found if contact not found with supplied id.', done => {
      request.put(`${url}/api/contact/12345`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .send(updatedContact)
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
  });

  describe('DELETE: /api/contact/:id', () => {
    before(done => {
      let user = new User(testUser);
      user.generatePasswordHash(testUser.password)
        .then(user => user.save())
        .then(user => {
          this.user = user;
          return user.generateToken();
        })
        .then(token => {
          this.token = token;
          done();
        })
        .catch(done);
    });

    before(done => {
      testContact.userId = this.user._id.toString();
      Contact.create(testContact)
        .then(contact => {
          this.contact = contact;
          done();
        })
        .catch(done);
    });

    after(() => {
      delete this.contact.userId;
    });

    it('should delete a contact', done => {
      request.delete(`${url}/api/contact/${this.contact._id}`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response.status).to.equal(204);
          done();
        });
    });

    it('should return unauthorized if no token provided.', done => {
      request.delete(`${url}/api/contact/${this.contact._id}`)
        .end((error, response) => {
          expect(response.status).to.equal(401);
          done();
        });
    });

    it('should return not found if contact not found with supplied id.', done => {
      request.delete(`${url}/api/contact/12345`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .end((error, response) => {
          expect(response.status).to.equal(404);
          done();
        });
    });
  });
});