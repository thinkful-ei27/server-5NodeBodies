'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const nodeSchema = mongoose.Schema({

  question: { type: String },
  videoURL: { type: String },
  textContent: { type: String },
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Node' }],
  answerA: { type: String },
  pointerA: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  answerB: { type: String },
  pointerB: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  answerC: { type: String },
  pointerC: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  answerD: { type: String },
  pointerD: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  ending: { type: Boolean },
  count: { type: Number }
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




let Node = mongoose.model('Node', nodeSchema);

module.exports = { Node };
