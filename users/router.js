const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');

const {User} = require('./models');

const router = express.Router();

router.use(jsonParser);

const strategy = new BasicStrategy(
  (username, password, cb) => {
    User
      .findOne({username})
      .exec()
      .then(user => {
        if (!user) {
          return cb(null, false, {
            message: 'Incorrect username'
          });
        }
        if (user.password !== password) {
          return cb(null, false, 'Incorrect password');
        }
        return cb(null, user);
      })
      .catch(err => cb(err))
});

passport.use(strategy);

router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }
  let {username, password, firstName, lastName} = req.body;
  // MyModel.create(docs) does new MyModel(doc).save() for every doc in docs.
  // And MyModel(doc).save() runs UserSchema.pre() which hashes the password
  // This ensures the password is properly hashed for POSTS, PUTS and unit tests
  return User
    .create({
      username,
      password,
      firstName,
      lastName
    })
    .then(user => {
      return res.location('/users/' + user._id).status(201).json({});
    })
    .catch(err => {

      // console.dir(err, {colors: true})

      if (err.name === 'ValidationError') {
          return res.status(422).json(err)
      } else if (err.name === 'MongoError') {
          return res.status(409).json({name: err.name, message: err.message, code: err.code})
      } else {
        return res.status(500).json({message: 'Internal server error'})
      }
    });
});

// never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => {
  return User
    .find()
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});


// NB: at time of writing, passport uses callbacks, not promises
const basicStrategy = new BasicStrategy(function(username, password, callback) {
  let user;
  User.findOne({username: username}).exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user)
      }
    });
});


passport.use(basicStrategy);
router.use(passport.initialize());

// basic strategy returns the current user document so simply return the representation
router.get('/me',
  passport.authenticate('basic', {session: false}),
  (req, res) => res.json(req.user.apiRepr())
);

router.put('/me', passport.authenticate('basic', {session: false }),
  (req, res) => {
    req.user = Object.assign(req.user, req.body);

    // document.save triggers mongoose middleware such as model.pre
    req.user.save()
    .then(user => {
      return res.json(user.apiRepr());
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
          return res.status(422).json(err)
      } else if (err.name === 'MongoError') {
          return res.status(422).json(err)
      } else {
        return res.status(500).json({message: 'Internal server error'})
      }
    });
  }
);

router.delete('/me', passport.authenticate('basic', {session: false }),
  (req, res) => {
    req.user.remove()
    .then(user => {
      return res.json({});
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error'})
    });
  }
);

router.get('/login', (req, res) => res.json({message: 'login page'}));

module.exports = {router};
