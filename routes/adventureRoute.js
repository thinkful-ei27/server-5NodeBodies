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
  return Adventure.find({creatorId: userId, _id: adventureId}).populate('nodes').populate('head')
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


router.get('/:adventureId/:nodeId', (req, res, next) => {
  const adventureId = req.params.adventureId;
  const nodeId = req.params.nodeId;
  return Node.find({_id: nodeId})
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
    parents: null,
    ending: true
    //  is this above ending to conditionally change what the ending is??
  }
  // create adventureId variable in accessible scope
  let adventureId;
  let adventure
  return createNewNode(headNode)
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
        adventure = _res
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
      return Adventure.findOne({_id: adventureId}).populate('nodes').populate('head')
    })
    .then((_res) => {
      return res.json(_res)
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

// helper fn that updates parent node L  or R pointers with  node id.
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

// added NEW created node to adventure
function addCreatedNodeToAdventure(adventureId, nodeId) {
  return Adventure.findOneAndUpdate(
    { _id: adventureId },
    { $push: { nodes: nodeId } }
  );
}

// create new node helper fn
function createNewNode(nodeToCreate) {
  return Node.create(nodeToCreate)
}

// validation helper function to check for adventure
function checkForAdventureInDatabase(adventureId) {
  return Adventure.findOne({ _id: adventureId })
    .then(adventure => {
      if (!adventure) {
        const err = new Error('Adventure Id does not exist in the Database')
        err.status = 400
        console.log(err)
        throw err
      } else return;
    });
}

// checks for parent in database
function checkForParentInDatabase(parentId) {
  return Node.findOne({ _id: parentId })
    .then(parent => {
      if (!parent) {
        const err = new Error('the parent Id does not exist in the Database')
        err.status = 400
        console.log(err)
        throw err
      } else return;
    });
}

// makes sure current user owns the adventure they are editing
function checkIfUserIsAdventureOwner(userId, adventureId) {
  return User.findOne({ userId })
    .then(user => {
      console.log(user)
      const adventure = user.adventures.filter(userAdventure => userAdventure === adventureId)
      if (!adventure) {
        const err = new Error('The user you are currently logged in as does not own this adventure!')
        err.status = 400
        console.log(err)
        throw err
      } else return;
    })
}

router.post('/newNode', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.id;
  console.log(req.user.userId)
  const {
    adventureId,
    parentId, // id
    parentAnswerLabel, //int
    question,
    rightAnswer,
    leftAnswer } = req.body;

  // check if parent id is a valid id
  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    const err = new Error('The `parentId` is not valid');
    err.status = 400;
    return next(err);
  }

  // checks if  adventure Id is a valid id
  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }

  let createdNode;

  return checkForAdventureInDatabase(adventureId)
    .then(() => {
      return checkForParentInDatabase(parentId)
    })
    .then(() => {
      return checkIfUserIsAdventureOwner(userId, adventureId)
    })
    .then(() => {
      // create the node
      const nodeToCreate = {
        parents: [parentId],
        question,
        rightAnswer,
        leftAnswer
      }

      return createNewNode(nodeToCreate)
    })
    .then((_res) => {
      createdNode = _res;
      const nodeId = createdNode.id;
      return updatePointerOnParent(parentId, parentAnswerLabel, nodeId);
    })
    .then(() => {
      const nodeId = createdNode.id;
      return addCreatedNodeToAdventure(adventureId, nodeId);
    })
    .then(() => {
      const responseObject = {
        adventureId,
        createdNode,
      }
      return res.json(responseObject);
    })
    .catch(err => {
      console.log(err)
      return next(err)
    });

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


//++++++ unused helper fns

// function getAdventureFromDatabase(adventureId) {
//   return Adventure.findOne({ _id: adventureId })
// }

// function getParentFromDatabase(parentId) {
//   return Node.findOne({ _id: parentId })
// }