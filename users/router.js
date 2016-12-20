const express = require('express');
const jsonParser = require('body-parser').json();

const {User} = require('./models');

const router = express.Router();

router.use(jsonParser);

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
      User
        .create({username, password})
        .then(user => res.status(201).json({}));
    })
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};
