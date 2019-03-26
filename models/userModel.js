'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

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
  name: { type: String, default: '' },
  adventures: [{type: mongoose.Schema.Types.ObjectId, ref: 'Adventure'}]
});
/*
wordList: [
    {
      _id: mongoose.mongoose.Schema.types.ObjectId,
      word: String,
      answer: String,
      memoryStrength: { type: Number, default: 1 },
      next: Number,
      correctCount: { type: Number, default: 0 },
      incorrectCount: { type: Number, default: 0 }
    }
  ]
*/

UserSchema.methods.serialize = function () {
  return {
    userId: this._id || '',
    username: this.username || '',
    name: this.name || '',
    adventures: this.adventures || []
  };
};

UserSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
})

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };
