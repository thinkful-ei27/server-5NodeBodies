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
      if (!adventure) {
        return Promise.reject(new Error('LearnVenture not found'));
      }
      res.json(adventure);
    }).catch(err => {
      if (err.message === 'Adventure not found') {
        err.status = 404;
      }
      return next(err);
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
  return Node.findOne({ _id: nodeId })
    .then(node => {
      if (node.length === 0) {
        return Promise.reject(new Error('Checkpoint not found'))
      }
      res.json(node)
    })
    .catch(err => {
      if (err.message === 'Checkpoint not found') {
        err.status = 404;
      }
      next(err);
    })
})


function videoValidate(videoURL){
  let videoID;
  let timeStamp;
  if (videoURL.includes("watch")) {
    let indexOf = videoURL.indexOf('?v=')
    videoID = videoURL.slice(indexOf + 3)

  } else if (videoURL.includes("embed")) {
    let indexOf = videoURL.indexOf('embed/')
    videoID = videoURL.slice(indexOf + 6)
  } else if ((videoURL.includes("youtu.be"))) {
    let indexOf = videoURL.indexOf('.be/')
    videoID = videoURL.slice(indexOf + 4)
  }
  if(videoURL.includes("&t")){
    let indexOf = videoURL.indexOf('&t');
    timeStamp = '#start' + videoURL.slice(indexOf + 2);
    timeStamp = timeStamp.slice(0, timeStamp.length - 1);
  }
  if(timeStamp){
    let indexOf = videoID.indexOf('&t');
    videoID = videoID.slice(0, indexOf);
    videoID = videoID + timeStamp;
  }
  let outputString = `https://www.youtube.com/embed/${videoID}`
  return outputString
}

//https://www.youtube.com/watch?v=VSVbAS3K3jw&t=322s
//the & becomes a ?, the t becomes a start 

//  adventure/newAdventure route creates a new adventure document, head node, and adds the adventure
// id to the user object.
router.post('/newAdventure', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.userId;
  const username = req.user.username;
  let { title,
    startContent,
    startVideoURL,
    password } = req.body;
  let hasPassword = false;
  if (!title) {
    const error = new Error('Please provide a title for your LearnVenture!');
    error.status = 400;
    return next(error);
  }

  if (startVideoURL) {
    startVideoURL = videoValidate(startVideoURL)
  }
  if (password) {
    hasPassword = true;
  }

  //adventureArray in accessible scope for user update
  let adventureArray = [];
  // create adventureId variable in accessible scope
  let adventureId;
  let adventureObj = {
    title,
    startContent,
    startVideoURL,
    hasPassword,
    count: 0,
    creatorId: userId,
    creator: username
  }

  return User.findOne({ _id: userId })
    .then(_res => {
      //we grab the users current list of adventures and store for later
      adventureArray = _res.adventures
      if (password) {
        //adventures with password route
        return Adventure.hashPassword(password)
          .then(hash => {
            //after hashing the password, we store the hashed password as part of the adv obj
            adventureObj.password = hash;
            return Adventure.create(adventureObj);
          })
      } else {
        //Adventures with no password route
        return Adventure.create(adventureObj)
      }
    }).then(adventure => {
      adventureId = adventure._id;
      return User.findOneAndUpdate({ _id: userId }, { adventures: [...adventureArray, adventureId] })
    }).then(_res => {
      return Adventure.findById(adventureId).populate('nodes').populate('head')
    }).then(result => {
      return res.json(result);
    }).catch(err => {
      // does not require unique titles at the moment
      // if (err.code === 11000) {
      //   err = new Error('You already have an Adventure with this title. Pick a unique title!');
      //   err.status = 400;
      // }
      next(err);
    })



})

router.post('/newNode', jwtAuth, jsonParser, (req, res, next) => {
  let hasHead;
  const userId = req.user.id;
  let {
    title,
    adventureId,
    parentId, // id
    parentInt, //int
    question,
    answerB,
    answerA,
    answerC,
    answerD,
    videoURL,
    textContent,
    ending } = req.body;

  // checks if  adventure Id is a valid id
  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!ending && (!question || question === '')) {
    const err = new Error('You must ask a question');
    err.status = 400;
    return next(err);
  }

  if(videoURL){
    videoURL = videoValidate(videoURL)
  }

  // TODO: impliment once titles are success on front end

  let createdNode;

  return checkForAdventureInDatabase(adventureId)
    .then((adventure) => {
      return Adventure.findOne({ _id: adventureId })
        .then((adventure) => {
          if (adventure.head) {
            hasHead = true
          } else {
            hasHead = false
          }
        })
    })
    .then(() => {
      return checkIfUserIsAdventureOwner(userId, adventureId)
    })
    .then(() => {
      // create the node
      const nodeToCreate = {
        title,
        parents: [parentId],
        question,
        answerB,
        answerA,
        answerC,
        answerD,
        textContent,
        videoURL,
        ending
      }

      return createNewNode(nodeToCreate)
    })
    .then((_res) => {
      createdNode = _res;
      const nodeId = createdNode.id;
      if (!hasHead) {
        return Adventure.findOneAndUpdate({ _id: adventureId }, { head: _res })
          .then((_res) => {
            return updatePointerOnParent(parentId, parentInt, nodeId);
          })
      } else {
        return updatePointerOnParent(parentId, parentInt, nodeId);
      }

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

router.post('/linkNodes', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.id;
  const { adventureId, parentId, childId, parentInt } = req.body;

  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(childId)) {
    const err = new Error('The `nodeId` is not valid');
    err.status = 400;
    return next(err);
  }
  // validate all the ids
  return Promise.all([
    checkForAdventureInDatabase(adventureId),
    checkForParentInDatabase(parentId),
    checkForParentInDatabase(childId),
    checkIfUserIsAdventureOwner(userId, adventureId),
  ])
    .then(() => {
      // update Nodes with links
      return updatePointerOnParent(parentId, parentInt, childId)
    })
    .then(() => {
      return Node.findOne({ _id: childId })
    })
    .then((childNode) => {
      const parents = childNode.parents;
      return Node.findOneAndUpdate({ _id: childId },
        { parents: [...parents, parentId] }, { new: true })
    })
    .then(() => {

      return res.status(204).end()
    })
    .catch(
      err => next(err)
    )

})

router.put('/:adventureId/:nodeId', jwtAuth, jsonParser, (req, res, next) => {
  const adventureId = req.params.adventureId;
  const nodeId = req.params.nodeId;
  const userId = req.user.id;

  const {
    parentInt, //int
  } = req.body;

  // TODO, update route for ending nodes. 
  const updateableFields = [
    'title',
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

  if(nodeUpdates.videoURL){
    nodeUpdates.videoURL = videoValidate(nodeUpdates.videoURL)
  }

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
  if (nodeUpdates.title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (nodeUpdates.ending === false) {
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

  // define this variable for later use
  let nodeUpdatesAndUnsetValues;

  return Node.findById(nodeId)
    .then((node) => {
      // toggling ending boolean causes unforseen problems, turn this ability off for now.
      if (nodeUpdates.ending !== node.ending) {
        const err = new Error('You cannot change node types between ending and non-ending')
        err.status = 400;
        return next(err)
      }
      // remove optional values if not provided
      nodeUpdatesAndUnsetValues = removeOptionalValuesifAbsent(nodeUpdates)
      return checkForAdventureInDatabase(adventureId)
    })
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

// PUT Route for Adventure Starting Info
router.put('/:id', jwtAuth, jsonParser, (req, res, next) => {
  const adventureId = req.params.id;
  const userId = req.user.id;

  // TODO, update route for ending nodes. 
  const updateableFields = [
    'title',
    'startContent',
    'startVideoURL',
    'password',
  ];

  const adventureUpdates = {}

  if (req.body.password) {
    adventureUpdates['hasPassword'] = true;
  }

  if (req.body.removePassword) {
    adventureUpdates['hasPassword'] = false;
  }

  updateableFields.forEach(field => {
    if (field in req.body) {
      adventureUpdates[field] = req.body[field];
    }
  });

  if(adventureUpdates.startVideoURL){
    adventureUpdates.startVideoURL = videoValidate(adventureUpdates.startVideoURL)
  }
  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `adventureId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (adventureUpdates.title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (adventureUpdates.startContent === '') {
    const err = new Error('Missing `Adventure Info` in request body');
    err.status = 400;
    return next(err);
  }


  return checkIfUserIsAdventureOwner(userId, adventureId)
    .then(() => {
      if (adventureUpdates.password) {
        return Adventure.hashPassword(adventureUpdates.password)
          .then(hash => {
            //after hashing the password, we store the hashed password as part of the adv obj
            adventureUpdates.password = hash;
            return Adventure.findByIdAndUpdate({ _id: adventureId }, adventureUpdates, { new: true })
          })
      } else {
        return Adventure.findByIdAndUpdate({ _id: adventureId }, adventureUpdates, { new: true })
      }
    })
    .then(result =>
      res.json(result)
    )
    .catch(err => next(err))
})


// DEL a single node.
router.delete('/:adventureId/:nodeId', jwtAuth, jsonParser, (req, res, next) => {
  const nodeId = req.params.nodeId;
  const adventureId = req.params.adventureId;

  if (!mongoose.Types.ObjectId.isValid(nodeId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Adventure.findById(adventureId)
    .then((adventure) => {

      if (adventure.head.equals(nodeId)) {
        const err = new Error('You cannot remove the Starting checkpoint. Try editing it instead')
        err.status = 400;
        return next(err);
      }
      else {
        const removeNode = Node.findByIdAndRemove(nodeId);
        const removeIdFromParentsArrays = Node.updateMany(
          { parents: nodeId },
          { $pull: { parents: nodeId } }
        )

        const updateAdventure = Adventure.updateOne(
          { nodes: nodeId },
          { $pull: { nodes: nodeId } }
        );

        const updatePointerA = Node.updateMany(
          { pointerA: nodeId },
          { $unset: { pointerA: nodeId } }
        )
        const updatePointerB = Node.updateMany(
          { pointerB: nodeId },
          { $unset: { pointerB: nodeId } }
        )
        const updatePointerC = Node.updateMany(
          { pointerC: nodeId },
          { $unset: { pointerC: nodeId } }
        )
        const updatePointerD = Node.updateMany(
          { pointerD: nodeId },
          { $unset: { pointerD: nodeId } }
        )

        return Promise.all([
          removeNode,
          removeIdFromParentsArrays,
          updateAdventure,
          updatePointerA,
          updatePointerB,
          updatePointerC,
          updatePointerD])
      }
    })
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      return next(err);
    });
})



// DEL an entire adventure
router.delete('/:adventureId/', jwtAuth, jsonParser, (req, res, next) => {
  const adventureId = req.params.adventureId;
  const userId = req.user.id

  if (!mongoose.Types.ObjectId.isValid(adventureId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  return Adventure.findById(adventureId)
    .then(adventure => {
      return adventure.nodes.forEach(node => {
        return Node.findByIdAndRemove(node)
          .then(() => {
            return;
          })
      })
    })
    .then(()=>{
      const removeIdFromUserArray = User.updateOne(
        { _id: userId },
        { $pull: { adventures: adventureId } }
      )
      const deleteAdventure= Adventure.findByIdAndDelete(adventureId);
      return Promise.all([
        deleteAdventure,
        removeIdFromUserArray
      ])
    })
    .then(() => {
      return res.sendStatus(204);
    })
    .catch(err => {
      return next(err)
    })
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
function addCreatedNodeToAdventure(adventureId, nodeId, hasHead) {
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
        const err = new Error('LearnVenture Id does not exist in the Database')
        err.status = 400
        throw err
      } else return adventure
    });
}

function checkAdventureForHeadNode(adventureId) {
  return Adventure.findOne({ _id: adventureId })
    .then((adventure) => {
      if (adventure.head) {
        return true
      } else {
        return false
      }
    })
}

// checks for parent in database
function checkForParentInDatabase(parentId) {
  return Node.findOne({ _id: parentId })
    .then(parent => {
      if (!parent) {
        const err = new Error('the parent Id does not exist in the Database')
        err.status = 400
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
