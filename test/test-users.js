const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');
const mongoose = require('mongoose');
const app = require('../server').app;

const {
  User
} = require('../users/models');
const should = chai.should();

var UrlPattern = require('url-pattern');
const pattern = {
  "/users": new UrlPattern('/users'),
  "/users/:userId": new UrlPattern('/users/:userId')
}

chai.use(chaiHttp);
chai.use(spies);

describe('Test /user endpoints with empty database', () => {
  beforeEach((done) => {
    // Approach #1 Drop database and `ensureIndexes()`
    mongoose.connection.db.dropDatabase()
      .then(() => User.ensureIndexes())
      .then(() => done());

    // Approach #2 Remove items, retains indexes
    // User.remove({}).then( () => done())

  });
  describe('GET /users', () => {
    it('should return an empty list of users initially', () => {
      return chai.request(app)
        .get('/users')
        .then(res => {
          // Check that it's an empty array
          res.should.have.status(200);
          res.type.should.equal('application/json');
          res.charset.should.equal('utf-8');
          res.body.should.be.an('array');
          res.body.length.should.equal(0);
        });
    });
  });
});

describe('Test /user endpoints with prepopulated users', () => {
  // config dummy users to be used throughout across the tests
  let johnDoe = {
    username: 'john.doe@example.com',
    password: 'letmein',
    firstName: 'John',
    lastName: 'Doe'
  };
  let janeDoe = {
    username: 'jane.doe@example.com',
    password: 'password',
    firstName: 'Jane',
    lastName: 'Doe'
  };

  beforeEach((done) => {
    // Approach #2.5 Remove items and then insert dummy users
    User.remove({})
      .then(() => User.create([johnDoe, janeDoe]))
      .then(() => done())
  });

  describe('/users', () => {
    describe('GET', () => {
      it('should return a list of users', () => {
        return chai.request(app).get('/users')
          .then(res => {
            res.should.have.status(200);
            res.type.should.equal('application/json');
            res.charset.should.equal('utf-8');

            res.body.should.be.an('array');
            res.body.length.should.equal(2); //there are 2 dummy users in our DB

            res.body[0].should.be.an('object');
            res.body[0].should.have.property('username');
            res.body[0].should.have.property('firstName');
            res.body[0].should.have.property('lastName');

            // no password returned
            res.body[0].should.not.have.property('password');
          });
      });
    });

    describe('POST', () => {
      it('should allow adding a user', () => {
        let newUser = {
          username: 'new.user@example.com',
          password: 'password',
          firstName: 'new',
          lastName: 'user',
        };
        return chai.request(app).post('/users').send(newUser)
          .then(res => {
            // Check that an empty object is returned
            res.should.have.status(201);
            res.type.should.equal('application/json');
            res.charset.should.equal('utf-8');

            res.should.have.header('location');

            res.body.should.be.an('object');
            res.body.should.be.empty;

            let params = pattern["/users/:userId"].match(res.headers.location);
            // Fetch the user from the database, using the location header to get the ID
            return User.findById(params.userId).exec();
          })
          .then(result => {
            // Check that the user exists in the database
            should.exist(result);
            result.should.have.property('username');
            result.username.should.equal(newUser.username);
          });
      });
      it('should reject users without a username', () => {
        let badUser = {
          password: 'password',
          firstName: 'bad',
          lastName: 'user',
        };
        let spy = chai.spy();
        // Add a user without a username
        return chai.request(app).post('/users').send(badUser)
          .then(spy)
          .catch(err => {
            // If the request fails, make sure it contains the error
            let res = err.response;
            res.should.have.status(422);
            res.type.should.equal('application/json');
            res.charset.should.equal('utf-8');
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.name.should.equal('ValidationError');
            res.body.message.should.equal('User validation failed');
            res.body.errors.username.message.should.equal('Path `username` is required.');
          })
          .then(() => {
            // Check that the request didn't succeed
            spy.should.not.have.been.called();
          });
      });
      it('should reject invalid email usernames', () => {
        let spy = chai.spy();
        let badUser = {
          username: 42
        };
        // Add a user without a non-string username
        return chai.request(app).post('/users').send(badUser)
          .then(spy)
          .catch(err => {
            // If the request fails, make sure it contains the error
            let res = err.response;
            res.should.have.status(422);
            res.type.should.equal('application/json');
            res.charset.should.equal('utf-8');
            res.body.should.be.an('object');

            res.body.should.have.property('message');
            res.body.name.should.equal('ValidationError');
            res.body.message.should.equal('User validation failed');
            res.body.errors.username.message.should.equal(`Path \`username\` is invalid (${badUser.username}).`);
          })
          .then(() => {
            // Check that the request didn't succeed
            spy.should.not.have.been.called();
          });
      });
      it('should reject users without a password', () => {
        let badUser = {
          username: 'bad.user@example.com',
          firstName: 'bad',
          lastName: 'user',
        };
        let spy = chai.spy();
        return chai.request(app).post('/users').send(badUser)
          .then(spy)
          .catch(err => {
            let res = err.response;
            res.should.have.status(422);
            res.type.should.equal('application/json');
            res.charset.should.equal('utf-8');
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.name.should.equal('ValidationError');
            res.body.message.should.equal('User validation failed');
            res.body.errors.password.message.should.equal('Path `password` is required.');
          })
          .then(() => {
            spy.should.not.have.been.called();
          });
      });
      it('should reject duplicate entry for johnDoe', () => {
        let spy = chai.spy();
        return chai.request(app).post('/users').send(johnDoe)
          .then(spy)
          .catch(err => {
            // If the request fails, make sure it contains the error
            let res = err.response;
            res.should.have.status(409);
            res.type.should.equal('application/json');
            res.charset.should.equal('utf-8');
            res.body.should.be.an('object');

            res.body.should.have.property('name');
            res.body.name.should.equal('MongoError');
            res.body.code.should.equal(11000); // E11000 duplicate key error
          })
          .then(() => {
            // Check that the request didn't succeed
            spy.should.not.have.been.called();
          });
      });
    });

    describe('/users/me', function() {
      describe('GET', function() {
        it('should 401 on un-authenticated user', function() {
          let spy = chai.spy();
          // this call does not attempt to authenticate
          return chai.request(app).get('/users/me')
            .then(spy)
            .catch(function(err) {
              err.response.should.have.status(401);
            })
            .then(function() {
              spy.should.not.have.been.called();
            });
        });
        it('should 401 on failed username authentication', function() {
          let spy = chai.spy();
          // this call attempts a BAD username and good passowrd
          return chai.request(app).get('/users/me').auth('unknown', johnDoe.password)
            .then(spy)
            .catch(function(err) {
              err.response.should.have.status(401);
            })
            .then(function() {
              spy.should.not.have.been.called();
            });
        });
        it('should 401 on failed password authentication', function() {
          let spy = chai.spy();
          // this call attempts a good username and BAD passowrd
          return chai.request(app).get('/users/me').auth(johnDoe.username, 'bad-password')
            .then(spy)
            .catch(function(err) {
              err.response.should.have.status(401);
            })
            .then(function() {
              spy.should.not.have.been.called();
            });
        });
        it('successful authentication should return a single user', () => {
          return chai.request(app).get('/users/me').auth(johnDoe.username, johnDoe.password)
            .then(res => {
              res.should.have.status(200);
              res.type.should.equal('application/json');
              res.charset.should.equal('utf-8');
              res.body.should.be.an('object');

              res.body.username.should.equal(johnDoe.username);
              res.body.firstName.should.equal(johnDoe.firstName);
              res.body.lastName.should.equal(johnDoe.lastName);
              res.body.should.not.have.property('password');
            });
        });

      });

      describe('PUT', function() {
        it('should allow editing a user (john doe) firstName and lastName', function() {
          let updated = {
              firstName: 'test john',
              lastName: 'test doe',
            }
          return chai.request(app).put('/users/me').send(updated).auth(johnDoe.username, johnDoe.password)
            .then(res => {
              res.should.have.status(200);
              res.type.should.equal('application/json');
              res.charset.should.equal('utf-8');
              res.body.should.be.an('object');

              res.body.firstName.should.equal(updated.firstName);
              res.body.lastName.should.equal(updated.lastName);
              res.body.should.not.have.property('password');

              // Fetch the user from the database
              return User.findOne({
                username: johnDoe.username
              }).exec();
            })
            .then(result => {
              // Check DB that the user has been updated
              result.firstName.should.equal(updated.firstName);
              result.lastName.should.equal(updated.lastName);
            });
        });
        it('should allow changing a user username', function() {
            let updated = {
              username: 'new.email@example.com'
            }
            return chai.request(app).put('/users/me').send(updated).auth(johnDoe.username, johnDoe.password)
              .then(res => {
                res.should.have.status(200);
                res.type.should.equal('application/json');
                res.charset.should.equal('utf-8');
                res.body.should.be.an('object');

                res.body.username.should.equal(updated.username);
                res.body.should.not.have.property('password');

                // Fetch the user from the database
                return User.findOne({
                  username: updated.username
                }).exec();
            })
            .then(result => {
              // Check DB that the user has been updated
              result.username.should.equal(updated.username);
            });
        });
        it('should not allow changing a user username to an empty string', function() {
          let spy = chai.spy();

          let updated = {
            username: ''
          }
          return chai.request(app).put('/users/me').send(updated).auth(johnDoe.username, johnDoe.password)
            .then(spy)
            .catch(function(err) {
              err.response.should.have.status(422); // 422 Unprocessable Entity
            })
            .then(function() {
              spy.should.not.have.been.called();
            });
        });
        //Note there are hundreds of validation tests that can be run on email validation regex
        it('should not allow changing a user username to an invalid email', function() {
          let spy = chai.spy();
          let updated = {
            username: 'test.user@example' // no TLD (.com, .org, .gov etc...)
          }
          return chai.request(app).put('/users/me').send(updated).auth(johnDoe.username, johnDoe.password)
            .then(spy)
            .catch(function(err) {
              err.response.should.have.status(422); // 422 Unprocessable Entity
            })
            .then(function() {
              spy.should.not.have.been.called();
            });
        });
        it('should not allow changing a user username existing username', function() {
          //login as john doe and attempt to update username to jane doe
          let spy = chai.spy();
          let updated = {
            username: janeDoe.username
          }
          return chai.request(app).put('/users/me').send(updated).auth(johnDoe.username, johnDoe.password)
            .then(spy)
            .catch(function(err) {
              err.response.should.have.status(422); // 422 Unprocessable Entity
            })
            .then(function() {
              spy.should.not.have.been.called();
            });
        });
      });

      describe('DELETE', function() {
        it('successful authentication should return a single user', () => {
          return chai.request(app).delete('/users/me').auth(johnDoe.username, johnDoe.password)
            .then(res => {
              res.should.have.status(200);
              res.type.should.equal('application/json');
              res.charset.should.equal('utf-8');
              res.body.should.be.an('object');
              res.body.should.be.empty;

              // Fetch the user from the database
              return User.findOne({
                username: johnDoe.username
              }).exec();
          })
          .then(result => {
            should.not.exist(result);
          });

        });

      });
    });
  });
});
