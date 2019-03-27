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

//  adventure/newAdventure route creates a new adventure document, head node, and adds the adventure
// id to the user object.
router.post('/newAdventure', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.id;
  const { title,
    startContent,
    question,
    rightAnswer,
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
  return createNewNode(headNode)
    .then((_res) => {
      if (_res) {
        const nodeId = _res.id
        const adventureObj = {
          title,
          startContent,
          head: nodeId,
          nodes: [nodeId],
        }
        return Adventure.create(adventureObj)
      } else next();
    })
    .then((_res) => {
      if (_res) {
        adventureId = _res.id
        return User.findOne({ id: userId })
      } else next();
    })
    .then((_res) => {
      const adventureArr = _res.adventures
      return User.findOneAndUpdate(
        { id: userId },
        { adventures: [...adventureArr, adventureId] }
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

function updatePointerOnParent(parentId, parentAnswerLabel, nodeId) {
  if (parentAnswerLabel === 1) {
    return Node.findOneAndUpdate({ _id: parentId },
      { leftPointer: nodeId })
  }
  if (parentAnswerLabel === 2) {
    return Node.findOneAndUpdate({ _id: parentId },
      { rightPointer: nodeId })
  }
  else return;
}

function addCreatedNodeToAdventure(adventureId, nodeId) {
  return Adventure.findOneAndUpdate(
    { _id: adventureId },
    { $push: { nodes: nodeId } }
  );
}

function createNewNode(nodeToCreate) {
  return Node.create(nodeToCreate)
}

function getParentFromDatabase(parentId) {
  return Node.findOne({ _id: parentId })
}



router.post('/newNode', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.id;
  const {
    adventureId,
    parentId, // id
    parentAnswerLabel, //int
    question,
    rightAnswer,
    leftAnswer } = req.body;
  //create the node
  const nodeToCreate = {
    parent: [parentId],
    question,
    rightAnswer,
    leftAnswer
  }
  let createdNode;

  return createNewNode(nodeToCreate)
    .then((_res) => {
      createdNode = _res;
      const nodeId = createdNode.id;
      return updatePointerOnParent(parentId, parentAnswerLabel, nodeId);
    })
    .then(() => {
      console.log(adventureId, 'GAGEAHRAHRARH')
      const nodeId = createdNode.id;
      return addCreatedNodeToAdventure(adventureId, nodeId);
    })
    .then(() => {
      const responseObject = {
        adventureId: adventureId,
        createdNode,
      }
      console.log(responseObject);
      return res.json(responseObject);
    })
    .catch(err => console.log(err));

})

//  how do we go back to parent node and know 
// for sure which pointer to insert this newly created node id?

//use that id to update the parent (left or right)
//  put that id in in node array on adventuyre


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


//++++++ unused helper fns

// function getAdventureFromDatabase(adventureId) {
//   return Adventure.findOne({ _id: adventureId })
// }

// function getParentFromDatabase(parentId) {
//   return Node.findOne({ _id: parentId })
// }