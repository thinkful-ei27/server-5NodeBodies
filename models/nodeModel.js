'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const nodeSchema = mongoose.Schema({
  question: { type: String },
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Node' }],
  leftAnswer: { type: String },
  leftPointer: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  rightAnswer: { type: String },
  rightPointer: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  ending: { type: Boolean },
});


nodeSchema.set('toJSON', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
})



// Add `createdAt` and `updatedAt` fields
// wordSchema.set('timestamps', true);




const Node = mongoose.model('Node', nodeSchema);


module.exports = { Node };
