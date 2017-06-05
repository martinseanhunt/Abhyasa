exports.DATABASE_URL = process.env.DATABASE ||
                       global.DATABASE ||
                      'mongodb://localhost/abhyasa';
exports.TEST_DATABASE = (
  process.env.TEST_DATABASE ||
  'mongodb://localhost/abhyasa');
exports.PORT = process.env.PORT || 8080;