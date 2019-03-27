'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('../models/userModel');
const { Node } = require('../models/nodeModel');
const { Adventure } = require('../models/adventureModel');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });


//fullroute: '{BASE_URL}/api/adventure'

//This is a get ALL route: Finds all adventures created by the teacher
router.get('/', jwtAuth, (req, res, next) => {
  const userId = req.user.userId;
  return Adventure.find({creatorId: userId})
    .then(_res => {
      console.log(_res);
      res.json(_res);
    })
    .catch(err => {
      next(err);
    })
})

//This is a get One route: Finds only one specified adventure
router.get('/:id', jwtAuth, (req, res, next) => {
  const userId = req.user.userId;
  const adventureId = req.params.id;
  return Adventure.find({creatorId: userId, _id: adventureId})
    .then(adventure => {
      if(adventure.length === 0){
        return Promise.reject(new Error('Adventure not found'));
      }
      res.json(adventure);
    }).catch(err => {
      if(err.message === 'Adventure not found'){
        err.status = 404;
      }
      next(err);
    })
})

//  adventure/newAdventure route creates a new adventure document, head node, and adds the adventure
// id to the user object.
router.post('/newAdventure', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.userId;
  const username = req.user.username;
  const { title,
    startContent,
    question,
    rightAnswer,
    videoURL,
    leftAnswer } = req.body;

  if (!title) {
    const error = new Error('Please provide a title for your adventure!')
    error.status = 400;
    return next(error);
  }

  const headNode = {
    question,
    rightAnswer,
    leftAnswer,
    parent: null,
    ending: true
    //  is this above ending to conditionally change what the ending is??
  }
  // create adventureId variable in accessible scope
  let adventureId;

  return Node.create(headNode)
    .then((_res) => {
      if (_res) {
        const nodeId = _res.id
        const adventureObj = {
          title,
          startContent,
          videoURL,
          head: nodeId,
          nodes: [nodeId],
          creator: username,
          creatorId: userId
        }
        return Adventure.create(adventureObj)
      } else next();
    })
    .then((_res) => {
      if (_res) {
        adventureId = _res.id
        return User.findOne({ _id: userId })
      } else next();
    })
    .then((_res) => {
      const adventureArr = _res.adventures
      return User.findOneAndUpdate(
        { _id: userId },
        { adventures: [...adventureArr, adventureId]}
      )
    })
    .then((_res) => {
      return res.json(adventureId)
    })
    .catch(err => {
      console.log(err);
      if (err.code === 11000) {
        err = new Error('You already have an Adventure with this title. Pick a unique title!');
        err.status = 400;
      }
      next(err);
    });
})

//  adventure/newNode adds new nodes, attaches them to adventure with correct pointers

router.post('/newNode', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.id;
  const {
    adventureId,
    parent, // id
    question,
    rightAnswer,
    leftAnswer } = req.body;
  //create the node
  const newNode = {
    parent,
    question,
    rightAnswer,
    leftAnswer
  }
  return Node.create(newNode)
    .then((_res) => {
      res.json(_res);
      // Figure out a way to make sure L,R pointers point to expected children. 
      //  how do we go back to parent node and know 
      // for sure which pointer to insert this newly created node id?
    })

  //use that id to update the parent (left or right)
  //  put that id in in node array on adventuyre
})

/* 
* title: 'string'
* startTextContent: 'descripiton (could reading could be video url)
* startUrlcontent:
* firstNodequestion:
* leftAnswer,
* rightAnswer,
* }

validate user.id

make sure that it has valid inputs
(if no first question/ answers, require them)

/api/adventure/buildAventure

*/


module.exports = { router };