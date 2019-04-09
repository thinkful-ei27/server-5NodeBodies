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

describe('/api/student/', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  before(function () {
    return runServer(TEST_DATABASE_URL)
    .then(() => {
      //Putting a user into the db so that we can create an adventure to use on the student route
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
        title : 'TestTitle',
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
        title : 'New Test Title',
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
      console.log("Node Id is: ", nodeId)
    })
  })

  after(function () {
      return Adventure.findOneAndDelete({_id: adventureId})
      .then(() =>  User.findOneAndDelete({username}))
      .then(() => closeServer()) //Delete the adventure we created
    })

  beforeEach(function () { });

  afterEach(function () {
    
  });

  describe('/api/student/adventure/:id', function () {

    it('should successfully return a full adventure', function() {
      return chai
      .request(app)
      .post(`/api/student/adventure/${adventureId}`)
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.a('object');
        expect(_res.body).to.contain.keys('nodes', 'title', 'startContent', 'hasPassword', 'count', 'creatorId', 'creator', 'head', 'id');
        expect(_res.body.nodes).to.be.an('array');
        expect(_res.body.title).to.be.a('string');
        expect(_res.body.startContent).to.be.a('string');
        expect(_res.body.hasPassword).to.equal(false);
        expect(_res.body.count).to.be.a('number');
        expect(_res.body.creatorId).to.be.a('string');
        expect(_res.body.creator).to.be.a('string');
        expect(_res.body.head).to.be.a('string');
        expect(_res.body.head).to.have.length(24);
        expect(_res.body.id).to.be.a('string');
        expect(_res.body.id).to.have.length(24);
      })
    })

  })

  describe('/api/student/search', function () {
    it('should successfully return an array of adventures', function() {
      return chai
      .request(app)
      .get(`/api/student/search`)
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.an('array');
        expect(_res.body[0]).to.be.an('object');
        expect(_res.body[0]).to.contain.keys('nodes', 'title', 'startContent', 'hasPassword', 'count', 'creatorId', 'creator', 'id');
      })
    })

    it('should successfully return the adventure that is searched for', function() {
      return chai
      .request(app)
      .get(`/api/student/search/Test  Title`)
      .then( (_res) => {
        expect(_res).to.have.status(200);
        expect(_res.body).to.be.an('array');
        expect(_res.body[0]).to.be.an('object');
        expect(_res.body[0]).to.contain.keys('nodes', 'title', 'startContent', 'hasPassword', 'count', 'creatorId', 'creator', 'id');
        expect(_res.body[0].title).to.equal('Test  Title');
      })
    })
  })
  
  describe('/api/:adventureId/:nodeId', function () {
  //'/:adventureId/:nodeId'
    let adventureID;
    let nodeID;
    it('should get an adventure id from search, then access a node on that adventure', function() {
      return chai
      .request(app)
      .get(`/api/student/search/TestTitle`)
      .then( (_res) => {
        adventureID = _res.body[0].id;
        nodeID = _res.body[0].nodes[0];
        console.log("RES BODY IS******************", _res.body)
        return
      })
      .then(() => {
        return chai
        .request(app)
        .get(`/api/student/${adventureID}/${nodeID}`)
        .then((_res) => {
          expect(_res).to.have.status(200);
          expect(_res.body).to.be.an('object');
          expect(_res.body).to.contain.keys('parents', 'title', 'question', 'answerB', 'answerA', 'answerC', 'answerD', 'textContent', 'ending', 'id');
          expect(_res.body.id).to.have.length(24);
        })
      })
    })
  })
});