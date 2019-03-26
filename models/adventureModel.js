'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const adventureSchema = mongoose.Schema({
  title: {type: String},
  startContent: {type: String},
  nodes : [
    {_id: id,
    }
  ],
  endings: []
});
const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = { Adventure };
