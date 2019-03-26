'use strict';
<<<<<<< HEAD

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
=======
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, firstName = '', lastName = ''} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// Never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};
>>>>>>> user-models/login
