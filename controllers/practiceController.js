const mongoose = require('mongoose');
const Practice = mongoose.model('Practice');
const moment = require('moment');
const striptags = require('striptags');

// Helper functions

const confirmOwner = (practice, req, res) =>{
  // use .equals (a method that lives in an object id) to check an obj1ect id against a string
  if (!practice.author.equals(req.user._id)) {
    
    if (req.xhr) {
      // it was a json request
      res.json({
        err: "Not authorised to edit this item"
      })
      return;
    }

    req.flash('error', 'Not authorised to edit this item');
    res.redirect('back');
  } 
}

//----
 
exports.home = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  } 
  res.render('home', { title: 'Home' });
}

exports.dashboard = async (req, res) => {
  //set up pagination variables
  const currentPage = req.params.page || 1;
  const limit = 10;
  const skip = (currentPage * limit) - limit;
  const q = {
    author: req.user._id
  }

  // Store multiple queries as promises which we will allow to run async
  const practicesPromise = Practice
    .find(q)
    .skip(skip)
    .limit(limit)
    .sort({created: 'desc'});
  const countPromise = Practice.count(q);

  // Wait for both to run and destructure results to correct variable regardless of when they come back!
  const [practices, count] = await Promise.all([practicesPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  res.render('dashboard', { title: 'Dashboard', practices, currentPage, count, pages });
}


// API

exports.createPractice = async (req, res) => {

  // sanitize everything
  req.body.description = striptags(req.body.description);
  req.body.practiceType = striptags(req.body.practiceType);
  req.body.tags = striptags(req.body.tags);

  req.body.author = req.user._id;
  if (req.body.tags != '') {
    req.body.tags = req.body.tags.split(',').map(item => item.trim());
  } else {
    req.body.tags = [];
  }
  const practice = await (new Practice(req.body)).save();
  res.json(practice); 
}

exports.updatePractice = async (req, res) => {

  // sanitize everything
  req.body.description = striptags(req.body.description);

  const practice = await Practice.findById(req.body.id);
  confirmOwner(practice, req, res);

  const newPractice = await Practice.findOneAndUpdate({_id: req.body.id}, req.body, {
    new: true, 
    runValidators: true
  });

  res.json(newPractice);
}

exports.deletePractice = async (req, res) => {
  const practice = await Practice.findById(req.params.id);
  confirmOwner(practice, req, res);

  const deletedPractice = await Practice.findByIdAndRemove(req.params.id);

  res.json(deletedPractice);
}

exports.timeChart = async (req, res) => {

  // Get results from this year
  const practicesThisYear = await Practice
    .find({
      created: { 
        $gte: moment().startOf('year')
      },
      author: req.user._id
    },
    { 
      time: 1,
      created: 1
    }
    )
    .sort({created: 'desc'});

  // get month number of now
  const currentMonth = moment().format('M');

  // make array of months to use for the cal from start of year
  const labels = [];

  for (let i = 0; i < currentMonth; i++) {
    labels.push(moment().startOf('year').add(i, 'months').format('MMMM'));
  }
 
  // Add mins of each practice to month
  const mins = labels.map(data => 0);
  
  practicesThisYear.forEach((data) => {
    mins[moment(data.created).format('M') - 1] += data.time / 60;
  });

  res.json({
    labels,
    mins
  });
}

exports.tagsChart = async (req, res) => {

  // Get results
  const tags = await Practice.getTagsList(req.user._id);

  const json = {
    labels: [],
    counts: []
  } 

  /*
  tags.forEach(data => {
    json.labels.push(data._id);
    json.counts.push(data.count);
  }); */

  const results = tags.reduce((obj, tag) => {

    obj.labels.push(tag._id);
    obj.counts.push(tag.count);

    return obj;
  }, json);

  res.json(results);
}






