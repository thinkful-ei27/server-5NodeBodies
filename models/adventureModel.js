'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const adventureSchema = mongoose.Schema({

  title: {type: String},
  startContent: {type: String},
  head: {type: mongoose.Schema.Types.ObjectId, ref: 'Node'},
  nodes : [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Node'}
  ],
});
const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = { Adventure };
