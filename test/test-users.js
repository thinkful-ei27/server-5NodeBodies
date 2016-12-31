
const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');
const mongoose = require('mongoose');
const UrlPattern = require('url-pattern');
const app = require('../server').app;

const {User} = require('../users/models');
const should = chai.should();

chai.use(chaiHttp);
chai.use(spies);

describe('User endpoints', () => {
    beforeEach((done) => {
        // Drop the database before each test. Also drops indexes, so need to recreate using `ensureIndexes()`
        // mongoose.connection.db.dropDatabase(done);
        // User.ensureIndexes(); // recreate indexes so usernames are unique

        // Remove all existing users before each test, then create new testing users
        User.remove({}).then( () => {
          done();
        })

        this.singlePattern = new UrlPattern('/users/:userId');
        // this.listPattern = new UrlPattern('/users');
    });

    describe('/users', () => {
        describe('GET', () => {
            it.skip('should return an empty list of users initially', () => {
                return chai.request(app)
                    .get('/users')
                    .then( res => {
                        // Check that it's an empty array
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('array');
                        res.body.length.should.equal(0);
                    });
            });
            it.only('should return a list of users', () => {
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              // Create a user directly in the DB and then get
              // return new User(user).save()
              return User.create(user)
                    .then(() => chai.request(app).get('/users'))
                    .then( res => {
                      console.dir(res.body.length, {colors: true})
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');

                        res.body.should.be.an('array');
                        res.body.length.should.equal(1); //there are 2 dummy users in our DB
                        res.body[0].should.be.an('object');

                        res.body[0].should.not.have.property('password');
                        res.body[0].username.should.equal(user.username);
                        res.body[0].firstName.should.equal(user.firstName);
                        res.body[0].lastName.should.equal(user.lastName);
                    });
            });
          });

        describe('POST', () => {
            it('should allow adding a user', () => {
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              return chai.request(app).post('/users').send(user)
                  .then( res => {
                      // Check that an empty object is returned
                      res.should.have.status(201);
                      res.type.should.equal('application/json');
                      res.charset.should.equal('utf-8');

                      res.should.have.header('location');

                      res.body.should.be.an('object');
                      res.body.should.be.empty;

                      let params = this.singlePattern.match(res.headers.location);
                      // Fetch the user from the database, using the location header to get the ID
                      return User.findById(params.userId).exec();
                  })
                  .then( res =>  {
                      // Check that the user exists in the database
                      should.exist(res);
                      res.should.have.property('username');
                      res.username.should.equal(user.username);
                  });
            });
            it('should reject users without a username', () => {
                let user = {};
                let spy = chai.spy();
                // Add a user without a username
                return chai.request(app)
                    .post('/users')
                    .send(user)
                    .then(spy)
                    .catch( err => {
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
                let user = {
                    username: 42
                };
                // Add a user without a non-string username
                return chai.request(app)
                    .post('/users')
                    .send(user)
                    .then(spy)
                    .catch( err => {
                        // If the request fails, make sure it contains the error
                        let res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');

                        res.body.should.have.property('message');
                        res.body.name.should.equal('ValidationError');
                        res.body.message.should.equal('User validation failed');
                        res.body.errors.username.message.should.equal(`Path \`username\` is invalid (${user.username}).`);
                    })
                    .then(() => {
                        // Check that the request didn't succeed
                        spy.should.not.have.been.called();
                    });
            });

            it('should reject duplicate', () => {
                let spy = chai.spy();
                let user = {
                    username: 'test.user@example.com',
                    password: 'letmein',
                    firstName: 'test',
                    lastName: 'user',
                };
                // Create a user directly in the DB and then get
                // return new User(user).save()
                return User.create(user)
                    .then((user) => chai.request(app).post('/users').send(user))
                    .then(spy)
                    .catch( err => {
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
                return chai.request(app)
                    .get('/users/me')
                    .then(spy)
                    .catch(function(err) {
                        let res = err.response;
                        // console.dir(res, {colors:true});
                        res.should.have.status(401);
                    })
                    .then(function() {
                        spy.should.not.have.been.called();
                    });
            });

            it('should return a single user', () => {
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              // Create a user directly in the DB and then get
              // return new User(user).save()
              return User.create(user)
                  .then( () => {
                    return chai.request(app).get('/users/me').auth(user.username, user.password);
                  })
                  .then( res => {
                      // console.dir(res.body, {colors: true})
                      // Check that the user's information is returned
                      res.should.have.status(200);
                      res.type.should.equal('application/json');
                      res.charset.should.equal('utf-8');
                      res.body.should.be.an('object');

                      res.body.username.should.equal(user.username);
                      res.body.firstName.should.equal(user.firstName);
                      res.body.lastName.should.equal(user.lastName);
                      res.body.should.not.have.property('password');
                  });
            });

        });

        describe('PUT', function() {
            it('should allow editing a user firstName and lastName', function() {
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              let newUser = {
                  firstName: 'new-test',
                  lastName: 'new-user',
              }
              // Create a user directly in the DB and then get
              // return new User(user).save()
              return User.create(user)
                  .then( () => {
                      return chai.request(app).put('/users/me').send(newUser).auth(user.username, user.password);
                  })
                  .then( res => {
                      // Check that an empty object was returned
                      // console.dir(res.body, {colors: true})
                      res.should.have.status(200);
                      res.type.should.equal('application/json');
                      res.charset.should.equal('utf-8');
                      res.body.should.be.an('object');

                      res.body.firstName.should.equal(newUser.firstName);
                      res.body.lastName.should.equal(newUser.lastName);
                      res.body.should.not.have.property('password');

                      // Fetch the user from the database
                      return User.findOne({username: user.username}).exec();
                  })
                  .then( user => {
                      // Check DB that the user has been updated
                      user.firstName.should.equal(newUser.firstName);
                      user.lastName.should.equal(newUser.lastName);
                  });
            });

            it('should allow changing a user username', function() {
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              let newUser = {
                  username: 'new-test.user@example.com'
              }
              // Create a user directly in the DB and then get
              // return new User(user).save()
              return User.create(user)
                  .then( () => {
                      return chai.request(app).put('/users/me').send(newUser).auth(user.username, user.password);
                  })
                  .then( res => {
                      // Check that an empty object was returned
                      // console.dir(res.body, {colors: true})
                      res.should.have.status(200);
                      res.type.should.equal('application/json');
                      res.charset.should.equal('utf-8');
                      res.body.should.be.an('object');

                      res.body.username.should.equal(newUser.username);
                      res.body.should.not.have.property('password');

                      // Fetch the user from the database
                      return User.findOne({username: newUser.username}).exec();
                  })
                  .then( user => {
                      // Check DB that the user has been updated
                      user.username.should.equal(newUser.username);
                  });
            });

            it('should not allow changing a user username to an empty string', function() {
              let spy = chai.spy();
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              let newUser = {
                  username: ''
              }

              // Create a user directly in the DB and then get
              // return new User(user).save()
              return User.create(user)
                  .then( () => {
                      return chai.request(app).put('/users/me').send(newUser).auth(user.username, user.password);
                  })
                  .then(spy)
                  .catch(function(err) {
                      let res = err.response;
                      // console.dir(res, {colors:true});
                      res.should.have.status(422); // 422 Unprocessable Entity
                  })
                  .then(function() {
                      spy.should.not.have.been.called();
                  });
            });

            //Note there are hundreds of validation tests that can be run on email validation regex
            it('should not allow changing a user username to an invalid email', function() {
              let spy = chai.spy();
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              let newUser = {
                  username: 'test.user@example' // no TLD (.com, .org, .gov etc...)
              }

              // Create a user directly in the DB and then get
              // return new User(user).save()
              return User.create(user)
                  .then( () => {
                      return chai.request(app).put('/users/me').send(newUser).auth(user.username, user.password);
                  })
                  .then(spy)
                  .catch(function(err) {
                      let res = err.response;
                      // console.dir(res, {colors:true});
                      res.should.have.status(422); // 422 Unprocessable Entity
                  })
                  .then(function() {
                      spy.should.not.have.been.called();
                  });
            });

            it('should not allow changing a user username existing username', function() {
              let spy = chai.spy();
              let existing = {
                  username: 'existing-user@example.com',
                  password: 'Password1',
                  firstName: 'existing',
                  lastName: 'user',
              };
              let user = {
                  username: 'test.user@example.com',
                  password: 'letmein',
                  firstName: 'test',
                  lastName: 'user',
              };
              let newUser = {
                  username: 'existing-user@example.com'
              }

              // Create a user directly in the DB and then get
              return User.create([existing, user])
                  .then( (result) => {
                      return chai.request(app).put('/users/me').send(newUser).auth(user.username, user.password);
                  })
                  .then(spy)
                  .catch(function(err) {
                      let res = err.response;
                      // console.dir(res, {colors:true});
                      res.should.have.status(422); // 422 Unprocessable Entity
                  })
                  .then(function() {
                      spy.should.not.have.been.called();
                  });
            });

            it('should reject non-string usernames', function() {
                /*let user = {
                    _id: '000000000000000000000000',
                    username: 42
                };
                let spy = chai.spy();
                // Add a user with a non-string username
                return chai.request(app)
                    .put(this.singlePattern.stringify({
                        userId: user._id
                    }))
                    .send(user)
                    .then(spy)
                    .catch(function(err) {
                        // If the request fails, make sure it contains the
                        // error
                        let res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Incorrect field type: username');
                    })
                    .then(function() {
                        // Check that the request didn't succeed
                        spy.called.should.be.false;
                    });*/
            });

        });

        describe('DELETE', function() {
            it('should 404 on non-existent users', function() {
                /*let spy = chai.spy();
                // Try to delete a non-existent user
                return chai.request(app)
                    .delete(this.singlePattern.stringify({userId: '000000000000000000000000'}))
                    .then(spy)
                    .catch(function(err) {
                        // If the request fails, make sure it contains the
                        // error
                        let res = err.response;
                        res.should.have.status(404);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('User not found');
                    })
                    .then(function() {
                        // Check that the request didn't succeed
                        spy.called.should.be.false;
                    });*/
            });

            it('should delete a user', function() {
                /*let user = {
                    username: 'joe'
                };
                let userId;
                // Create a user in the database
                return User.create(user)
                    .then(function(res) {
                        userId = res._id.toString();
                        // Request to delete the user
                        return chai.request(app)
                            .delete(this.singlePattern.stringify({
                                userId: userId
                            }));
                    }.bind(this))
                    .then(function(res) {
                        // Make sure that an empty object was returned
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.be.empty;

                        // Try to fetch the user from the database
                        return User.findById(userId);
                    })
                    .then(function(res) {
                        // Make sure that no user could be fetched
                        should.not.exist(res);
                    });*/
                });
            });
        });
    });
});
