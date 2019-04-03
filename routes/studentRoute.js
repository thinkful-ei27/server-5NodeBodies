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
  return Adventure.find()
    .then(adventures => {
      return res.json(adventures)
    })
    .catch(err => {
      next(err);
    })
});

router.get('/search/:searchTerm', (req, res, next) => {
  let searchTerm = req.params.searchTerm;
  return Adventure.find({title: {$regex: searchTerm}})
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


router.get('/adventure/:id', (req, res, next) => { 
  const adventureId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }
  return Adventure.findOne({_id: adventureId})
  .then(adventure => {
    if(adventure.length === 0){
      return Promise.reject(new Error('Adventure not found'));
    }
  return res.json(adventure);
  // in case we want to return the // first node
  //   return adventure[0].head
  // })
  // .then(head => {
  //   return Node.find({_id: head})
  // })
  // .then(node => {
  //   res.json(node)
   })
  .catch(err => {
    if(err.message === 'Adventure not found'){
      err.status = 404;
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