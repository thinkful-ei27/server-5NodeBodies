const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const STATE_ABBREVIATIONS = Object.keys(require('./state-abbreviations'));

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    // match: /[a-zA-Z0-9]/, // name must be alpha characters
    match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, // validate email address
    index: { unique: true }
  },
  password: {
    type: String, // besides setting type, it also protects against injection attacks http://stackoverflow.com/a/38415968
    required: true,
    trim: true,
    validate: [(pwd) => 6 < pwd.length, "Password must be at least 6 characters"]
  },
  firstName: {type: String, default: ""},
  lastName: {type: String, default: ""}
});

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
}

UserSchema.methods.validatePassword = function(password) {
  return bcrypt
    .compare(password, this.password)
    .then(isValid => isValid);
}

UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};
