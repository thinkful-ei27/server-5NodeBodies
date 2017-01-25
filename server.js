const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { router: usersRouter } = require('./users');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// logging
app.use(morgan('common'));

app.use('/users/', usersRouter);

app.use(express.static('public'));

app.use('*', (req, res) => res.status(404).json({ message: 'Not Found' }));

// referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, (error) => {
      if (error) {
        return reject(error);
      }
      console.log(`Mongoose is connected to ${DATABASE_URL}`);
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', (err) => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close((err) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      console.info('closed');
      resolve();
    });
  }));
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
