'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const adventureSchema = mongoose.Schema({


  title: { type: String },
  startContent: { type: String },
  startVideoURL: { type: String },
  creator: { type: String },
  //Should we have a description? (Useful for teachers and students)
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  nodes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }
  ],
  hasPassword: { type: Boolean },
  password: {
    type: String
  }
});

// adventure titles must be unique per userId
adventureSchema.index({ title: 1, userId: 1 }, { unique: true });

adventureSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

adventureSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
    delete ret.password;
  }
})

let Adventure = mongoose.model('Adventure', adventureSchema);

module.exports = { Adventure };
