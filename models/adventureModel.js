'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const adventureSchema = mongoose.Schema({
  title: {type: String},
  startContent: {type: String},
  nodes : [
    //{nodestuff}
  ],
  endings: []
});

UserSchema.methods.serialize = function () {
  return {
    userId: this._id || '',
    username: this.username || '',
    name: this.name || '',
    adventures: this.adventures || []
  };
};


const Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = { Adventure };
