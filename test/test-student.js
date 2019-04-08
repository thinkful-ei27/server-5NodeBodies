'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../models/userModel');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);
let adventureId;
let token;
let nodeId;

describe('/api/student/', function () {

  before(function () {
    const username = 'exampleUser';
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';
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
        title : 'Test adventure Title',
        startContent: 'Test Starter Content',
        startVideoURL : 'https://www.youtube.com/watch?v=QtXby3twMmI'
      })
    })
    .then((_res) => {
      adventureId =  _res.body.id;
      console.log("Adventure id is: ", _res.body.id)
      .request(app)
      .post('/api/adventure/newNode')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title : 'New Title',
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
      nodeId = _res.body.id
      console.log("Node Id is: ", _res.body.id)
    })
  })

  after(function () {
    return chai
      .request(app)
      .delete(`/api/${adventureId}/${nodeId}`)
      .set('Authorization', 'Bearer ' + token) //Delete the node we created
    .then( (_res) => {
      return chai
      .request(app)
      .delete(`/api/${adventureId}`)
      .set('Authorization', 'Bearer ' + token) //Delete the node we created
    })
    .then(() => closeServer())
  });

  beforeEach(function () { });

  afterEach(function () {
    return User.remove({});
  });




  });