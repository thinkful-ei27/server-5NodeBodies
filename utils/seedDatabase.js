'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');

const User = require('../models/userModel');
const Adventure = require('../models/adventureModel');
const Node = require('../models/nodeModel');

const {nodes, adventures, users} = require('../database/data');


console.log(`Connecting to mongodb at 'mongodb://testUser:Testing123@ds223756.mlab.com:23756/adventure-learning-test'`);
 mongoose.connect('mongodb://testUser:Testing123@ds223756.mlab.com:23756/adventure-learning-test', { useNewUrlParser: true, useCreateIndex : true })
  .then(() => {
    console.log('Deleting Data...');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.log('Creating Indexes');
    return Promise.all([
      User.ensureIndexes(),
      Adventure.ensureIndexes(),
      Node.ensureIndexes(),
    ]);
  })
  .then(() => {
    console.log('Seeding Database...');
    return Promise.all([
      Node.insertMany(nodes),
      Adventure.insertMany(adventures),
      User.insertMany(users),
    ]);
  })
  .then(results => {
    console.log(`Inserted results with no errors, ${results}`);
    console.info('Disconnecting...');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
