const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../start');

// Enables chai .should tests
const should = chai.should();

// Enables HTTP requests through chai
chai.use(chaiHttp);

// Start the tests
describe('Practices', function() {

  before(function() {
    // why do these have to return the function? Guessing something I'm missing about promises
    return runServer();
  });

  after(function() {
    return closeServer();
  });

});
