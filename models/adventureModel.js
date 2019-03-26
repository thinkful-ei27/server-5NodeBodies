'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const adventureSchema = mongoose.Schema({
  
  title: {type: String},
  startContent: {type: String},
  nodes : [
    {type: Schema.Types.ObjectId, ref: 'Node'}
  ],
});
const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = { Adventure };
