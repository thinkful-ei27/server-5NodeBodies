'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('../models/userModel');

const router = express.Router();

const jsonParser = bodyParser.json();

module.exports = {router};