const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

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
    // we use a set list of state abbreviations
    state: {type: String, enum: STATE_ABBREVIATIONS}
  }
});

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    address: this.address || {} }
}

UserSchema.methods.validatePassword = function(password) {
  return new Promise(function(resolve, reject) {
    return bcrypt.compare(password, this.password, function(err, isValid) {
      if (err) {
        return reject(err);
      }
      return resolve(isValid);
    });
  });
}

UserSchema.statics.hashPassword = function(password) {
  return bcrypt
    .hash(password, 10)
    .then(hash => hash);
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};