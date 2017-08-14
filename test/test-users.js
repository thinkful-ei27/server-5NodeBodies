'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');
const mongoose = require('mongoose');

const { User } = require('../users/models');
const { app, runServer, closeServer } = require('../server');

const { TEST_DATABASE_URL } = require('../config');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// UrlPattern allows us to easily create urls for that match our restful service.
// It is sorta like the reverse of express route /path/:item ==> {item: value}
const UrlPattern = require('url-pattern');

const pattern = {
  '/users': new UrlPattern('/users'),
  '/users/:userId': new UrlPattern('/users/:userId'),
};

// This let's us make HTTP requests in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);
chai.use(spies);

// config dummyUsers. Used to seed the database a
// And referenced in various tests
const seedData = {
  johnDoe: {
    username: 'john.doe@example.com',
    password: 'letmein',
    firstName: 'John',
    lastName: 'Doe',
  },
  janeDoe: {
    username: 'jane.doe@example.com',
    password: 'password',
    firstName: 'Jane',
    lastName: 'Doe',
  },
};

// The `createSeedData` function populates our database with
// dummy data. It is called by the beforeEach() hook below.
function seedUserData(...args) {
  // Insert dummy users using `.create()` instead of `insertMany()` because create
  // executes mongoose middleware, specifically `UserSchema.pre('save', ...)`
  // which hashs the passwords of each dummy user.
  return User.create(args);
}

// Drop the database before each test. Note, this also drops indexes, so we need to
// recreate them using `ensureIndexes()` to ensure that the usernames are unique
// http://mongoosejs.com/docs/api.html#model_Model.ensureIndexes
// Also note, the preformance concerns are for production, not testing
function tearDownDb() {
  return mongoose.connection.dropDatabase().then(() => User.ensureIndexes());
}

describe('Users API Resource', () => {
  // before runs once at the beginning of the test suite
  before(() => runServer(TEST_DATABASE_URL));

  // beforeEach runs once before *each* tests begin
  beforeEach(() => seedUserData(seedData.johnDoe, seedData.janeDoe));

  // afterEach runs once at the *end* of each test
  afterEach(() => tearDownDb());

  // after runs at the end of the tests
  after(() => closeServer());

  describe('Endpoints', () => {
    describe('GET', () => {
      it('should return a list of users', () => chai.request(app).get('/users')
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          // there are 2 test users in our DB
          res.body.length.should.equal(2);
          res.body.forEach((item) => {
            item.should.be.an('object');
            item.should.have.property('username');
            item.should.have.property('firstName');
            item.should.have.property('lastName');
            item.should.not.have.property('password'); // no password returned
          });
        }));
    });

    describe('POST', () => {
      it('should allow adding a user', () => {
        const newUser = {
          username: 'new.user@example.com',
          password: 'password',
          firstName: 'new',
          lastName: 'user',
        };
        return chai.request(app).post('/users').send(newUser)
          .then((res) => {
            // Best Practice for POST calls that result in a creation, is use a HTTP 201 status code
            // and include a Location header that points to the URL of the new resource.
            // You *may* also return a representation of the resource as part of the response.
            res.should.have.status(201);
            res.should.have.header('location');
            res.body.username.should.equal(newUser.username);
            res.body.firstName.should.equal(newUser.firstName);
            res.body.lastName.should.equal(newUser.lastName);
            res.body.should.not.have.property('password');
            const params = pattern['/users/:userId'].match(res.headers.location);
            // Fetch the user from the database, using the location header to get the ID
            return User.findById(params.userId).exec();
          })
          .then((result) => {
            // Check that the user exists in the database
            should.exist(result);
            result.should.have.property('username');
            result.username.should.equal(newUser.username);
          });
      });
      it('should return 422 status when rejecting a user without a username', () => {
        const badUser = {
          password: 'password',
          firstName: 'bad',
          lastName: 'user',
        };
        const spy = chai.spy();
        // Add a user without a username
        return chai.request(app).post('/users').send(badUser)
          .then(spy)
          .catch((err) => {
            // If the request fails, make sure it contains the error
            const res = err.response;
            res.should.have.status(422);
          })
          .then(() => {
            // Check that the request didn't succeed
            spy.should.not.have.been.called();
          });
      });
      it('should return 422 status when rejecting a user with invalid email usernames', () => {
        const spy = chai.spy();
        const badUser = {
          username: 35,
        };
        // Add a user without a non-string username
        return chai.request(app).post('/users').send(badUser)
          .then(spy)
          .catch((err) => {
            // If the request fails, make sure it contains the error
            const res = err.response;
            res.should.have.status(422);
          })
          .then(() => {
            // Check that the request didn't succeed
            spy.should.not.have.been.called();
          });
      });
      it('should return 422 status when rejecting a user without a password', () => {
        const badUser = {
          username: 'bad.user@example.com',
          firstName: 'bad',
          lastName: 'user',
        };
        const spy = chai.spy();
        return chai.request(app).post('/users').send(badUser)
          .then(spy)
          .catch((err) => {
            const res = err.response;
            res.should.have.status(422);
          })
          .then(() => {
            spy.should.not.have.been.called();
          });
      });
      it('should return 409 status when rejecting duplicate entry', () => {
        const spy = chai.spy();
        const testUser = seedData.johnDoe;
        return chai.request(app).post('/users').send(testUser)
          .then(spy)
          .catch((err) => {
            // If the request fails, make sure it contains the error
            const res = err.response;
            res.should.have.status(409);
          })
          .then(() => {
            // Check that the request didn't succeed
            spy.should.not.have.been.called();
          });
      });
    });

    describe('/users/me', () => {
      describe('GET', () => {
        it('should return an object matching the authenticated user', () => {
          const testUser = seedData.johnDoe;
          return chai.request(app).get('/users/me').auth(testUser.username, testUser.password)
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.username.should.equal(testUser.username);
              res.body.firstName.should.equal(testUser.firstName);
              res.body.lastName.should.equal(testUser.lastName);
              res.body.should.not.have.property('password');
            });
        });
        it('should return status 401 on un-authenticated user', () => {
          const spy = chai.spy();
          // Note, this call does not attempt to authenticate
          return chai.request(app).get('/users/me')
            .then(spy)
            .catch((err) => {
              err.response.should.have.status(401);
            })
            .then(() => {
              spy.should.not.have.been.called();
            });
        });
        it('should return status 401 on failed username authentication', () => {
          const spy = chai.spy();
          const testUser = seedData.johnDoe;
          // this call attempts a BAD username and good passowrd
          return chai.request(app).get('/users/me').auth('unknown', testUser.password)
            .then(spy)
            .catch((err) => {
              err.response.should.have.status(401);
            })
            .then(() => {
              spy.should.not.have.been.called();
            });
        });
        it('should return status 401 on failed password authentication', () => {
          const spy = chai.spy();
          // this call attempts a good username and BAD passowrd
          const testUser = seedData.johnDoe;
          return chai.request(app).get('/users/me')
            .auth(testUser.username, 'bad-password')
            .then(spy)
            .catch((err) => {
              err.response.should.have.status(401);
            })
            .then(() => {
              spy.should.not.have.been.called();
            });
        });
      });

      describe('PUT', () => {
        it('should allow editing a user (john doe) firstName and lastName', () => {
          const updated = {
            firstName: 'test john',
            lastName: 'test doe',
          };
          const testUser = seedData.johnDoe;
          return chai.request(app)
            .put('/users/me')
            .send(updated)
            .auth(testUser.username, testUser.password)
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.firstName.should.equal(updated.firstName);
              res.body.lastName.should.equal(updated.lastName);
              res.body.should.not.have.property('password');
              // Fetch the user from the database
              return User.findOne({
                username: testUser.username,
              }).exec();
            })
            .then((result) => {
              // Check DB that the user has been updated
              result.firstName.should.equal(updated.firstName);
              result.lastName.should.equal(updated.lastName);
            });
        });
        it('should allow changing a user username', () => {
          const updated = {
            username: 'new.email@example.com',
          };
          const testUser = seedData.johnDoe;
          return chai.request(app).put('/users/me').send(updated).auth(testUser.username, testUser.password)
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.username.should.equal(updated.username);
              res.body.should.not.have.property('password');
              // Fetch the user from the database
              return User.findOne({
                username: updated.username,
              }).exec();
            })
            .then((result) => {
              // Check DB that the user has been updated
              result.username.should.equal(updated.username);
            });
        });
        it('should return status 422 when updating a username to an empty string', () => {
          const spy = chai.spy();
          const updated = { username: '' };
          const testUser = seedData.johnDoe;
          return chai.request(app).put('/users/me').send(updated).auth(testUser.username, testUser.password)
            .then(spy)
            .catch((err) => {
              err.response.should.have.status(422); // 422 Unprocessable Entity
            })
            .then(() => {
              spy.should.not.have.been.called();
            });
        });
        // Note there are hundreds of validation tests that can be run on email validation regex
        it('should return status 422 when updating username to an invalid email', () => {
          const spy = chai.spy();
          // no TLD (.com, .org, .gov etc...)
          const updated = { username: 'test.user@example' };
          const testUser = seedData.johnDoe;
          return chai.request(app).put('/users/me').send(updated).auth(testUser.username, testUser.password)
            .then(spy)
            .catch((err) => {
              err.response.should.have.status(422); // 422 Unprocessable Entity
            })
            .then(() => {
              spy.should.not.have.been.called();
            });
        });
        it('should return status 409 when updating to existing username', () => {
          // login as john doe and attempt to update username to jane doe
          const spy = chai.spy();
          const updated = { username: seedData.janeDoe.username };
          const testUser = seedData.johnDoe;
          return chai.request(app).put('/users/me').send(updated).auth(testUser.username, testUser.password)
            .then(spy)
            .catch((err) => {
              err.response.should.have.status(409);
            })
            .then(() => {
              spy.should.not.have.been.called();
            });
        });
      });

      describe('DELETE', () => {
        it('should delete a user if user authenticates successful', () => {
          const testUser = seedData.johnDoe;
          return chai.request(app).delete('/users/me').auth(testUser.username, testUser.password)
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.should.be.empty;
              // Fetch the user from the database
              return User.findOne({
                username: testUser.username,
              }).exec();
            })
            .then((result) => {
              should.not.exist(result);
            });
        });
      });
    });
  });
});
