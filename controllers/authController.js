const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login', 
  failureFlash: 'Failed Login!',
  successRedirect: '/dashboard',
  successFlash: 'You are now logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'you are now logged out');
  res.redirect('/login');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You need to be logged in to do that!');
  res.redirect('/login');
} 