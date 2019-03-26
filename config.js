'use strict';
<<<<<<< HEAD

exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/basic-auth-demo';


exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                            'mongodb://localhost/test-basic-auth-demo';

exports.PORT = process.env.PORT || 8080;
=======
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/CYOA';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/CYOA';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
>>>>>>> user-models/login
