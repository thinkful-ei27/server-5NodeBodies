const { BasicStrategy } = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');

const { User } = require('./models');

const router = express.Router();

router.use(jsonParser);

/* Plain-text password check
const strategy = new BasicStrategy((username, password, cb) => {
    User.findOne({username}).exec()
      .then(user => {
        if (!user) {
          return cb(null, false);
        }
        if (user.password !== password) {
          return cb(null, false);
        }
        return cb(null, user);
      })
      .catch(err => cb(err))
});

passport.use(strategy);
*/

router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'No request body' });
  }
  const { username, password, firstName, lastName } = req.body;
  // MyModel.create(docs) does new MyModel(doc).save() for every doc in docs.
  // And MyModel(doc).save() runs UserSchema.pre() which hashes the password
  // This ensures the password is properly hashed for POSTS, PUTS and unit tests

  return User
    .create({ username, password, firstName, lastName })
    // Best Practice for POST calls that result in a creation, is use a HTTP 201 status code
    // and include a Location header that points to the URL of the new resource.
    // You *may* also return a representation of the resource as part of the response.
    .then(user => res.location(`/users/${user._id}`).status(201).json(user.apiRepr()))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(422).json(err);
      } else if (err.name === 'MongoError') {
        return res.status(409).json({ message: 'Validation Error' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    });
});

// never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => User.find().exec()
  .then(users => res.json(users.map(user => user.apiRepr())))
  .catch(err => console.log(err) && res.status(500).json({ message: 'Internal server error' })));

// NB: at time of writing, passport uses callbacks, not promises
const basicStrategy = new BasicStrategy((username, password, callback) => {
  User.findOne({ username }).exec()
    .then((user) => {
      if (!user) {
        return callback(null, false);
      }

      return user.validatePassword(password)
        .then((isValid) => {
          if (!isValid) {
            return callback(null, false);
          }
          return callback(null, user);
        });
    }).catch(err => callback(err));
});


passport.use(basicStrategy);
router.use(passport.initialize());

// basic strategy authentications returns the current `user` document
// so simply return the representation
router.get('/me',
  passport.authenticate('basic', { session: false }),
  (req, res) => res.json(req.user.apiRepr()));

// basic strategy authentications returns the current `user` document
// So we update the user and save
router.put('/me', passport.authenticate('basic', { session: false }),
  (req, res) => {
    req.user = Object.assign(req.user, req.body);

    // document.save triggers mongoose middleware such as model.pre
    req.user.save()
      .then(user => res.json(user.apiRepr()))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res.status(422).json(err);
        } else if (err.name === 'MongoError') {
          return res.status(409).json({ message: 'Conflict' });
        }
        return res.status(500).json({ message: 'Internal server error' });
      });
  });

router.delete('/me', passport.authenticate('basic', { session: false }),
  (req, res) => {
    req.user.remove()
      .then(() => res.json({}))
      .catch(() => res.status(500).json({ message: 'Internal server error' }));
  });

module.exports = { router };
