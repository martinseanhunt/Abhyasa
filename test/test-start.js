const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const {app, runServer, closeServer} = require('../start');
const sinon = require('sinon');
const Practice = mongoose.model('Practice');
const User = mongoose.model('User');
const {TEST_DATABASE} = require('../config');
const {dashboard, createPractice, updatePractice, deletePractice} = require('../controllers/practiceController');

let user;

// Enables chai .should tests
const should = chai.should();

// Enables HTTP requests through chai
chai.use(chaiHttp);

// Generate a user 
function seedUser () {
  user = new User({
    email: faker.internet.email(),
    name: faker.name.firstName(),
  });

  return;
}

// Generate 6 entries wiht above fake user
async function seedData() {
  const seedData = [];

  for (let i=0; i < 6; i++) {
    seedData.push(generatePostData());
  }

  // returns promise
  return Practice.insertMany(seedData);
}

function generatePostData() {
  return {
    description: faker.lorem.paragraphs(),
    practiceType: faker.lorem.words(),
    tags: `${faker.random.word()}, ${faker.random.word()}, ${faker.random.word()}`,
    time: faker.random.number(),
    author: user._id
  }
}

function tearDownDb(){
  return mongoose.connection.dropDatabase();
}

// Start the tests
describe('Practices', function() {

  before(function() {
    return runServer(TEST_DATABASE);
  });

  beforeEach(function() {
    seedUser();
    return seedData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('API ENDPOINTS', function() {

    it('should create a test practice', function() {

      const req = {
        user,
        body: {
          description: faker.lorem.paragraphs(),
          practiceType: faker.lorem.words(),
          tags: `${faker.random.word()}, ${faker.random.word()}, ${faker.random.word()}`,
          time: faker.random.number()
        }
      }
     
      const res = {};
      const spy = res.json = sinon.spy();

      return createPractice(req, res).then(result => {

        const spyresult = spy.firstCall.args[0];

        spyresult.should.be.a('object');
        spyresult.description.should.equal(req.body.description);
        spyresult.practiceType.should.equal(req.body.practiceType);
        spyresult.author.should.equal(user._id);
        spyresult.tags.should.be.a('array');
        spyresult.tags.should.have.lengthOf(3);

        // Why doesn't this work
        // spyresult.should.include.keys('description', 'practiceType', 'tags', '_id', 'time', 'created');
        
        return Practice.findById(spyresult._id); 
      }).then(dbresult => {
        // dbresult.should.include.keys('_id', 'description', 'practiceType', 'author', 'time', 'tags', 'created');
        dbresult.should.be.a('object');
        dbresult.description.should.equal(req.body.description);
        dbresult.practiceType.should.equal(req.body.practiceType);
        dbresult.author.equals(user._id).should.equal(true);
        dbresult.tags.should.be.a('array');
        dbresult.tags.should.have.lengthOf(3);
        dbresult.time.should.equal(req.body.time);
      });
        

      /*

      console.log('args: why are the args giving us what was returned?');
      console.log(spy.firstCall.args);

      console.log('sinons returned:');
      console.log(spy.firstCall.result);

      console.log('our returned: Why is this undefined?');
      console.log(returned);
      // if we manually set the returned val to something in the create function it works as expected... what? 
      */


    });

    it('should read all practices on dashboard', function() {
      const req = {
        user,
        params: {}
      }
     
      const res = {};
      const spy = res.render = sinon.spy();

      return dashboard(req, res).then(result => {
        // the second array result is the object with all the data to render so we can grab the practices from there
        const returned_practices = spy.firstCall.args[1].practices;

        returned_practices.should.be.a('array');
        returned_practices.should.have.length.of.at.least(6);

        returned_practices.forEach(function(practice) {
          practice.should.be.a('object');
          // practice.should.include.keys('title', 'author', 'content', 'created');
        });

        firstPractice = returned_practices[0];
        return Practice.findById(firstPractice._id);
      }).then(function(practice) {
        
        practice._id.equals(firstPractice._id).should.equal(true);;
        practice.description.should.equal(firstPractice.description);
        practice.practiceType.should.equal(firstPractice.practiceType);
        practice.author.equals(user._id).should.equal(true);
        practice.time.should.equal(firstPractice.time);
        practice.tags.should.be.a('array');
      });
      

    });

    it('should update practice', function() {
      const req = {
        user,
        body: {
          description: faker.lorem.paragraphs(),
        }
      }
     
      const res = {};
      const spy = res.json = sinon.spy();

      return Practice.findOne()
        .then(function(practice) {
          req.body.id = practice._id;

          return updatePractice(req, res)
        }).then(function(res) {
          return Practice.findById(req.body.id);
        })
        .then(function(practice) {
          practice.description.should.equal(req.body.description);
        });

    });
    

    it('should delete a test practice', function() {

      const req = {
        user,
        params : {}
      }
     
      const res = {};
      const spy = res.json = sinon.spy();

      let practice;
      return Practice
        .findOne()
        .then(function (_practice) {
          practice = _practice;
          req.params.id = practice._id;
          return deletePractice(req, res);
        }).then(function(res) {
          return Practice.findById(practice.id);
        }).then(function(_practice) {
          should.not.exist(_practice);
        });

    });


    

  });

    

});
