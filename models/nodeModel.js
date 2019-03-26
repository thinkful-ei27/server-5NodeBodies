'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const nodeSchema = mongoose.Schema({
  question : {type: String},
  parent : [{type: mongoose.Schema.Types.ObjectId, ref: 'Node'}],
  leftAnswer : {type: String},
  leftPointer : {type: mongoose.Schema.Types.ObjectId, ref: 'Node'},
  rightAnswer : {type: String},
  rightPointer : {type: mongoose.Schema.Types.ObjectId, ref: 'Node'},
  ending : {type: Boolean},
});




const Node = mongoose.model('Node', nodeSchema);

module.exports = { Node };
