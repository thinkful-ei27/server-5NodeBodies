global.DATABASE_URL = 'mongodb://localhost/basic-auth-test'

var runServer = require('../server').runServer;

before(function(done) {
    runServer().then(done).catch( err => {
      console.log(err);
    });
});
