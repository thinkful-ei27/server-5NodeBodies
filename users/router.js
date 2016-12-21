const express = require('express');
const jsonParser = require('body-parser').json();

const {User} = require('./models');

const router = express.Router();

router.use(jsonParser);

const passport = require('passport');
const {BasicStrategy} = require('passport-http');


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

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }

  username = username.trim();

  if (username === '') {
    return res.status(422).json({message: 'Incorrect field length: username'});
  }

  if (!('password' in req.body)) {
    return res.status(422).json({message: 'Missing field: password'});
  }

  let {password} = req.body;

  if (typeof password !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: password'});
  }

  password = password.trim();

  if (password === '') {
    return res.status(422).json({message: 'Incorrect field length: password'});
  }

  // check for existing user
  User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, create a new one
      console.log(`Creating new user for ${username}`);
      User
        .create({username, password})
        .then(user => {
          return passport.authenticate(
            'basic', {session: true},
            (req, res) => {console.log('got here'), res.status(201).json({})});
        });
    })
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});




const ensureLoggedIn = (req, res, next) => {
  req.user ? next() : res.status(401).json(
    {message: 'restricted to authenticated users'});
}

router.get('/me', ensureLoggedIn, (req, res) => {
  User
    .findOne({username: req.user.username})
    .exec()
    .then(user => res.json(user))
    .catch(err => res.status(500).json({message: 'internal server error'}));
});


module.exports = {router};
