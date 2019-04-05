'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('../models/userModel');
const { Node } = require('../models/nodeModel');
const { Adventure } = require('../models/adventureModel');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');
const mongoose = require('mongoose');

const jwtAuth = passport.authenticate('jwt', { session: false });

//fullroute: '{BASE_URL}/api/student'
// 5c9ce70225a9ad1651bf9fe6



router.get('/search', (req, res, next) => {
  //It would be good to limit the data that comes back as this is a catch all
  return Adventure.find()
    .then(adventures => {
      return res.json(adventures)
    })
    .catch(err => {
      next(err);
    })
});

router.get('/search/:searchTerm', (req, res, next) => {
  //It would be good to limit the data that comes back as this is just a search
  let searchTerm = req.params.searchTerm;
  console.log(`search term is ${searchTerm}`);
  return Adventure.find({title: {$regex: searchTerm, $options: 'i'}}).collation({locale: 'en_US', strength: 2})
    .then(adventures => {
      if(adventures.length === 0){
        return Promise.reject(new Error('No Matching Adventures Found'));
      }
      return res.json(adventures);
    })
    .catch(err => {
      if(err.message === 'No Matching Adventures Found'){
        err.status = 404
      }
      next(err);
    })
})


router.post('/adventure/:id', jsonParser, (req, res, next) => {
  console.log(req.body);
  const password = req.body.password;
  const adventureId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }
  let adventure;
  return Adventure.findOne({_id: adventureId})
  .then(result => {
    adventure = result;
    console.log(adventure, 'This is adventure');
    if(adventure.length === 0){
      return Promise.reject(new Error('Adventure not found'));
    }
    if(adventure.hasPassword){
      console.log('Comparing passwords... user submission is:', password);
      if (password === undefined){
        return Promise.reject({
          reason: 'PasswordError',
          message: 'This LearnVenture requires a password'
        })
      }
      return adventure.validatePassword(password)
        .then(isValid => {
          if(!isValid){
            console.log('PASSWORD IS NOT VALID!')
            return Promise.reject({
              reason: 'PasswordError',
              message: 'Incorrect Password'
            })
          }
          return;
        })
    }})
    .then(() => {
      if (adventure.count) {
        console.log('adventure does have a count!');
        return Adventure.findByIdAndUpdate(adventureId, {count : (adventure.count + 1)})
      } else {
        console.log('this is adventure', adventure);
        return Adventure.findByIdAndUpdate(adventureId, {count :  1})
      }
    })
    .then(node => {
      console.log('Node ran!');
      console.log(node)
      res.json(node)
    })
    .catch(err => {
      if(err.message === 'Adventure not found'){
        err.status = 404;
      }
      if(err.message === 'Incorrect Password'){
        err.status = 401;
      }
      if(err.message === 'This LearnVenture requires a password'){
        err.status = 401;
      }
      next(err);
    })
  })


router.get('/:adventureId/:nodeId', (req, res, next) => { 
  const adventureId = req.params.adventureId;
  const nodeId = req.params.nodeId;
  // return Adventure.find({_id: adventureId})
  // .then(adventure => {
  //   if(adventure.length === 0){
  //     return Promise.reject(new Error('Adventure not found'));
  //   }
  // })
  // .then(head => {
  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(nodeId)) {
    const err = new Error('The `nodeId` is not valid');
    err.status = 400;
    return next(err);
  }
  return Node.findOne({_id: nodeId})
  // })
  .then(node => {
    if (node.length === 0){
      return Promise.reject(new Error ('Node not found'))
    }
    console.log(node)
    let nodeId = req.params.nodeId;
    console.log(nodeId)
    if (node.count) {
      return Node.findByIdAndUpdate(nodeId, {count : (node.count + 1)})
    } else {
      return Node.findByIdAndUpdate(nodeId, {count :  1})
    }
   })
   .then(node => {
     console.log(node)
     res.json(node)
   })
  .catch(err => {
    if(err.message === 'Node not found'){
      err.status = 404;
    }
    next(err);
  })
})

module.exports = { router };