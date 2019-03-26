'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('../models/userModel');
const { Node } = require('../models/nodeModel');
const { Adventure } = require('../models/adventureModel');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');



// //  creation of a new adventure document
// {
// 
// /api/adventure/newAdventure
const jwtAuth = passport.authenticate('jwt', { session: false });


router.post('/newAdventure', jwtAuth, jsonParser, (req, res, next) => {
  const userId = req.user.id;
  const { title,
    startContent,
    question,
    rightAnswer,
    leftAnswer } = req.body;

  const headNode = {
    question,
    rightAnswer,
    leftAnswer,
    parent: null
  }

  console.log(headNode);
  let adventureId;
  return Node.create(headNode)
  .then((_res)=>{
    const nodeId = _res.id
    const adventureObj = {
      title,
      startContent,
      head: nodeId,
      nodes : [nodeId],
    }
    return Adventure.create(adventureObj)
  })
  .then((_res) => {
    adventureId = _res.id
    return User.findOne({ id: userId })
  })
  .then((_res) => {
    const adventureArr = _res.adventures
    return User.findOneAndUpdate({ id: userId }, {adventures : [...adventureArr, adventureId]})
  })
  .then((_res) => {
    return res.json(adventureId)
   })
})

router.post('/newNode', jwtAuth, jsonParser, (req, res, next) => {

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

create HEAD node,
create adventure ,
tag adventure to user schema.


/api/adventure/buildAventure

nodeobject={
 question
 left answer
 right answer
 lpointer 2 
 rpointer 7
 parent

}

*/


module.exports = { router };