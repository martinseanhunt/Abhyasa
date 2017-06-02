const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const practiceSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    required: 'Please enter a description'
  },
  practiceType: {
    type: String,
    required: 'Please enter a practiceType'
  },
  created: {
    type: Date, 
    default: Date.now
  }, 
  tags: [String],
  time: {
    type: Number, 
    default: 0
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Must supply author'
  }
});

practiceSchema.statics.getTagsList = function(userId) {
  // "this" is the model
  return this.aggregate([
    // Only get items that belong to our user
    { $match: { author: userId } },
    // Unwind takes gives us a unique result for each tag 
    // so if a result has tags of "testing, some, tags"
    // I'll get 3 results back with the same id, author, desc etc
    // the $ sign says we're looking for a field on the model
    { $unwind: '$tags' }, 
    // group the above results together where the ID will become the tag
    // for each instance of that tag add one to a new field called count
    { $group: { _id: '$tags', count: {$sum: 1} } },
    { $sort : {count: -1} },
    { $limit : 7 }
  ]);
}


module.exports = mongoose.model('Practice', practiceSchema);