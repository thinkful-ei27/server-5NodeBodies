exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/basic-auth-demo';
exports.PORT = process.env.PORT || 8080;