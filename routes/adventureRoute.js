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
  return Adventure.find({ creatorId: userId })
    .then(_res => {
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
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `userId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }
  return Adventure.findOne({ creatorId: userId, _id: adventureId }).populate('nodes').populate('head')
    .then(adventure => {
      if (adventure.length === 0) {
        return Promise.reject(new Error('Adventure not found'));
      }
      res.json(adventure);
    }).catch(err => {
      if (err.message === 'Adventure not found') {
        err.status = 404;
      }
      next(err);
    })
})


router.get('/:adventureId/:nodeId', (req, res, next) => {
  const adventureId = req.params.adventureId;
  const nodeId = req.params.nodeId;
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
  return Node.find({ _id: nodeId })
    .then(node => {
      if (node.length === 0) {
        return Promise.reject(new Error('Node not found'))
      }
      res.json(node)
    })
    .catch(err => {
      if (err.message === 'Node not found') {
        err.status = 404;
      }
      next(err);
    })
})

const videoValidate(videoURL){
  let videoID;

  return videoID;
}

//  adventure/newAdventure route creates a new adventure document, head node, and adds the adventure
// id to the user object.
router.post('/newAdventure', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.userId;
  const username = req.user.username;
  const { title,
    startContent,
    question,
    answerB,
    startVideoURL,
    answerA,
    answerC,
    answerD,
    videoURL,
    textContent } = req.body;

  if (!title) {
    const error = new Error('Please provide a title for your adventure!')
    error.status = 400;
    return next(error);
  }

  const headNode = {
    question,
    textContent,
    videoURL,
    answerB,
    answerA,
    answerC,
    answerD,
    parents: null,
    ending: false
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
          startVideoURL,
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
        { adventures: [...adventureArr, adventureId] }
      )
    })
    .then((_res) => {
      return Adventure.findOne({ _id: adventureId }).populate('nodes').populate('head')
    })
    .then((_res) => {
      return res.json(_res)
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('You already have an Adventure with this title. Pick a unique title!');
        err.status = 400;
      }
      next(err);
    });
})

router.post('/newNode', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.id;
  const {
    adventureId,
    parentId, // id
    parentInt, //int
    question,
    answerB,
    answerA,
    answerC,
    answerD,
    videoURL,
    textContent } = req.body;

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
        answerB,
        answerA,
        answerC,
        answerD,
        textContent,
        videoURL
      }

      return createNewNode(nodeToCreate)
    })
    .then((_res) => {
      createdNode = _res;
      const nodeId = createdNode.id;
      return updatePointerOnParent(parentId, parentInt, nodeId);
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
      return next(err)
    });
})

router.put('/:adventureId/:nodeId', jwtAuth, jsonParser, (req, res, next) => {
  const adventureId = req.params.adventureId;
  const nodeId = req.params.nodeId;
  const userId = req.user.id;
  const {
    parentInt, //int
  } = req.body;

  // TODO, update route for ending nodes. 
  // TODO update route for multiple parents

  const updateableFields = [
    'parents',
    'question',
    'answerA',
    'answerB',
    'answerC',
    'answerD',
    'videoURL',
    'textContent',
    'ending',
  ];

  const nodeUpdates = {}

  updateableFields.forEach(field => {
    if (field in req.body) {
      nodeUpdates[field] = req.body[field];
    }
  });

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
  if (nodeUpdates.question === '') {
    const err = new Error('Missing `question` in request body');
    err.status = 400;
    return next(err);
  }
  if (nodeUpdates.answerA === '' || !nodeUpdates.answerA) {
    const err = new Error('Must provide at least one answer. `answerA` in request body');
    err.status = 400;
    return next(err);
  }
  if (!nodeUpdates.ending) {
    nodeUpdates.ending = false;
  }

  if (nodeUpdates.parents) {
    nodeUpdates.parents.forEach(parent => {
      Node.findById(parent)
        .then((result) => {
          if (!result) {
            const err = new Error('The `parents` array contains an invalid id');
            err.status = 400;
            return next(err);
          } else return;
        });
    });
  }

  // remove optional values if not provided
  const nodeUpdatesAndUnsetValues = removeOptionalValuesifAbsent(nodeUpdates)

  return checkForAdventureInDatabase(adventureId)
    .then(() => {
      return checkIfUserIsAdventureOwner(userId, adventureId)
    })
    .then(() => {
      return Node.findByIdAndUpdate({ _id: nodeId }, nodeUpdatesAndUnsetValues, { new: true })
    })
    .then(result =>
      res.json(result)
    )
    .catch(err => next(err))

})

function removeOptionalValuesifAbsent(nodeUpdates) {

  const optionalValues = [
    'answerB',
    'answerC',
    'answerD',
    'videoURL',
    'textContent',];

  const valuesToUnset = {}

  optionalValues.forEach(value => {
    if (nodeUpdates[value] === '' || !nodeUpdates[value]) {
      delete nodeUpdates[value];
      return valuesToUnset[value] = ''
    }
  })

  const unusedOptionalValues = Object.keys(valuesToUnset);
  if (unusedOptionalValues.length > 0) {
    nodeUpdates.$unset = valuesToUnset
  }
  return nodeUpdates;
};


// helper fn that updates parent node L  or R pointers with  node id.
function updatePointerOnParent(parentId, parentInt, nodeId) {
  if (parentInt === 1) {
    return Node.findOneAndUpdate({ _id: parentId },
      { pointerA: nodeId })
  }
  if (parentInt === 2) {
    return Node.findOneAndUpdate({ _id: parentId },
      { pointerB: nodeId })
  }
  if (parentInt === 3) {
    return Node.findOneAndUpdate({ _id: parentId },
      { pointerC: nodeId })
  }
  if (parentInt === 4) {
    return Node.findOneAndUpdate({ _id: parentId },
      { pointerD: nodeId })
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
      const adventure = user.adventures.filter(userAdventure => userAdventure === adventureId)
      if (!adventure) {
        const err = new Error('The user you are currently logged in as does not own this adventure!')
        err.status = 400
        throw err
      } else return;
    })
}


module.exports = { router };
