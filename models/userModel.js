const mongoose = require('mongoose');
const validator = require('validator');
const mongooseDbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

// This shouldn't be needed as it's in start js but this suppresses an error message, this is a mongoose bug!
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  email: {
    type: String, 
    unique: true, 
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address'],
    required: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  }
});

// Passport plugin takes care of password hashing / storing etc
userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

// Creates better errors for unique:true
userSchema.plugin(mongooseDbErrorHandler);

module.exports = mongoose.model('User', userSchema);