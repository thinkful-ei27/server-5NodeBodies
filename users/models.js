'use strict';
<<<<<<< HEAD

=======
>>>>>>> user-models/login
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
<<<<<<< HEAD
    trim: true,
    // match: /[a-zA-Z0-9]/, // name must be alpha characters
    match: /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/, // validate email address
    index: { unique: true },
  },
  password: {
    type: String, // besides setting type, it also protects against injection attacks http://stackoverflow.com/a/38415968
    required: true,
    trim: true,
    validate: [pwd => pwd.length > 6, 'Password must be at least 6 characters'],
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
}, { emitIndexErrors: true });

UserSchema.methods.apiRepr = function () {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
=======
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: { type: String, default: '' },
  adventures: []
});

UserSchema.methods.serialize = function () {
  return {
    userId: this._id || '',
    username: this.username || '',
    name: this.name || '',
    adventures: this.adventures || []
>>>>>>> user-models/login
  };
};

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

<<<<<<< HEAD
UserSchema.pre('save', function callback(next) {
  const user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// removed since hashing is now done in `UserSchema.pre('save', ...)`
/* UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};*/
=======
UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};
>>>>>>> user-models/login

const User = mongoose.model('User', UserSchema);

module.exports = { User };
