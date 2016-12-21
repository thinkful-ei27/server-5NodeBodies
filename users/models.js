const mongoose = require('mongoose');

const STATE_ABBREVIATIONS = Object.keys(require('./state-abbreviations'));

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ""},
  lastName: {type: String, default: ""},
  address: {
    streetNumber: {type: String},
    streetName: {type: String},
    zipCode: {type: Number},
    city: {type: String},
    state: {type: String, enum: STATE_ABBREVIATIONS}
  }
});

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    address: this.address
  }
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};