const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Get ENV variables
require('dotenv').config({ path: 'variables.env' });

// Get config vars
const {PORT, DATABASE_URL} = require('./config');

// Import all models. They can then be imported by name in any file
require('./models/practiceModel');
require('./models/userModel');

// Import the app
const app = require('./app');

// Server needs to exist outside of the function, is set in runServer and needs to be accessed by closeServer
let server; 

// Connect to DB and start server - return promise for unit testing
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
      // Connect to DB, if fail, stop function and return error
      mongoose.connect(databaseUrl);
      mongoose.connection.on('error', err => {
        return reject(err);
      });

      // Start the app
      server = app.listen(port, () => {
        console.log(`Listening on ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
  });
}

// Close the server
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing Server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};