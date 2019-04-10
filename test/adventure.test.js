'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../models/userModel');
const { TEST_DATABASE_URL } = require('../config');
const { Adventure } = require('../models/adventureModel');
const expect = chai.expect;
chai.use(chaiHttp);
let adventureId;
let token;
let nodeId;
let secondNodeId;

describe('/api/adventure/', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  before(function () {
    return runServer(TEST_DATABASE_URL)
    .then(() => {
      //Putting a user into the db so that we can create an adventure for teacher to create
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          password,
          firstName,
          lastName
        })
  })
    .then((_res) => {
      console.log("create user is", _res.body)
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username,
          password,
        })
    })
    .then((_res) => {
      token =  _res.body.authToken
      console.log("Login res is: ", _res.body.authToken)
      return chai
      .request(app)
      .post('/api/adventure/newAdventure')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title : 'Test  Title3',
        startContent: 'Test Starter Content',
        startVideoURL : 'https://www.youtube.com/watch?v=QtXby3twMmI'
      })
    })
    .then((_res) => {
      adventureId =  _res.body.id;
      console.log("Adventure id is: ", _res.body.id)
      return chai
      .request(app)
      .post('/api/adventure/newNode')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title : 'New Title for Test',
        adventureId,
        question : 'New Test Node Question',
        answerB : 'New Test Node Answer B',
        answerA : 'New Test Node Answer A',
        answerC : 'New Test Node Answer C',
        answerD : 'New Test Node Answer D',
        textContent : 'New Test Node Text Content',
        ending : false
      })
    })
    .then(_res => {
      nodeId = _res.body.createdNode.id
      console.log(`nodeID is:${_res.body.createdNode.id}`)
      return
    })
  })

  after(function () {
      return Adventure.findOneAndDelete({_id: adventureId})
      .then(() => Adventure.findOneAndDelete({title: "Test  Title2"}))
      .then(() =>  User.findOneAndDelete({username}))
      .then(() => closeServer()) //Delete the adventure we created
    
    })

  beforeEach(function () { });

  afterEach(function () {
    
  });

  describe('GET /api/adventure/', function() {

    it('should successfully return a full adventure', function() {
      return chai
      .request(app)
      .get(`/api/adventure/`)
      .set('Authorization', 'Bearer ' + token)
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.a('array');
        expect(_res.body[0]).to.contain.keys('nodes', 'title', 'startContent', 'hasPassword', 'count', 'creatorId', 'creator', 'head', 'id');
      })
    })
    it('should return an adventure with corresponding adventureId', function() {
      return chai
      .request(app)
      .get(`/api/adventure/${adventureId}`)
      .set('Authorization', 'Bearer ' + token)
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.a('object');
        expect(_res.body).to.contain.keys('nodes', 'title', 'startContent', 'hasPassword', 'count', 'creatorId', 'creator', 'head', 'id');
      })
    })
    it('should return a node with corresponding nodeId', function() {
      return chai
      .request(app)
      .get(`/api/adventure/${adventureId}/${nodeId}`)
      .set('Authorization', 'Bearer ' + token)
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.a('object');
        expect(_res.body).to.contain.keys('parents', 'title', 'question', 'answerB', 'answerA', 'answerC', 'answerD', 'textContent', 'ending', 'id');
        expect(_res.body.id).to.have.length(24);
      })
    })

  describe('POST /api/adventure/newAdventure', function() {

    it('should create a new adventure', function() {
      return chai
      .request(app)
      .post(`/api/adventure/newAdventure/`)
      .set('Authorization', 'Bearer ' + token)
      .send({
        title : 'Test  Title2',
        startContent: 'Test Starter Content',
        startVideoURL : 'https://www.youtube.com/watch?v=QtXby3twMmI'
      })
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.a('object');
        expect(_res.body).to.contain.keys('title', 'startContent', 'startVideoURL');
      })
    })

    it ('should create a node for the created adventure', function() {
      return chai
      .request(app)
      .post('/api/adventure/newNode')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title : 'New Test Node Title',
        adventureId,
        question : 'New Test Node question',
        answerB : 'New Test Node Answer B',
        answerA : 'New Test Node Answer A',
        answerC : 'New Test Node Answer C',
        answerD : 'New Test Node Answer D',
        textContent : 'New Test Node Text Content',
        ending : false
      })
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.a('object');
        expect(_res.body).to.contain.keys('adventureId', 'createdNode');
        expect(_res.body.createdNode).to.contain.keys('parents', 'title', 'question', 'answerB', 'answerA', 'answerC', 'answerD', 'textContent', 'ending', 'id');
        expect(_res.body.createdNode.id).to.have.length(24);
        secondNodeId = _res.body.createdNode.id
      })
    })
    it ('should create a node for the created adventure', function() {
      return chai
      .request(app)
      .put(`/api/adventure/${adventureId}`)
      .set('Authorization', 'Bearer ' + token)
      .send({
        title : "a new title!",
        startContent: "New Start Content",
      })
      .then((_res) => {
        console.log("PUT IS:", _res.body)
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.a('object');
        expect(_res.body).to.contain.keys('nodes', 'title', 'startContent', 'hasPassword', 'count', 'creatorId', 'creator', 'head', 'id');
        expect(_res.body.title).to.equal('a new title!')
        expect(_res.body.startContent).to.equal('New Start Content')
        expect(_res.body.id).to.have.length(24);
      })
    })

    it ('should delete a node for the created adventure', function(){
      return chai
      .request(app)
      .delete(`/api/adventure/${adventureId}/${secondNodeId}`)
      .set('Authorization', 'Bearer ' + token)
      .then((_res) => {
        expect(_res).to.have.status(204);
      })
      })

      it ('should delete the created adventure', function(){
        return chai
        .request(app)
        .delete(`/api/adventure/${adventureId}`)
        .set('Authorization', 'Bearer ' + token)
        .then((_res) => {
          expect(_res).to.have.status(204);
        })
        })
      
  })
  })
  //we need to create one for the linked node madness... I (David) prefer to stay away from black magic
  //Looking at you mikey
});