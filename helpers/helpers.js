// Helpers that get passed to all the views
const moment = require('moment');
// Helps us to dump objects etc in to our view for testing / debugging
exports.dump = obj => JSON.stringify(obj, null, 2);

// Set the site name
exports.sitename = 'Abhyasa - A tool for practice';

// moment.js for displaying dates
exports.date = function(date) {

  var a = moment();
  var b = moment(date);

  if (moment.duration(a.diff(b)).asHours() < 3 ){
    return moment(date).fromNow();
  }
  else{
    return moment(date).format('MMMM Do YYYY'); 
  }

  return 'poop';

}