const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const striptags = require('striptags');
 
exports.createUser = async (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name').notEmpty();
  req.checkBody('email', 'You must supply a valid email').isEmail();

  // gets rid of some email modifiers
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false, 
    remove_extension: false, 
    gmail_remove_subaddress: false
  });

  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password must match password').equals(req.body.password);

  //runs above validation and stores errors
  const errors = req.validationErrors();

  if(errors) {
    // flash and return to page, send the body so we can repopulate
    req.flash('error', errors.map(err => err.msg));
    res.render('signup', {title: 'Sign Up', body: req.body, flashes: req.flash()});
    return;
  }

  // Now we can actually create the user
  const user = new User({
    name: striptags(req.body.name),
    email: striptags(req.body.email)
  });

  // .register is a passport-local-mongoose function, is callback based so needs to 
  // be promisified
  const registerWithPromise = promisify(User.register, User);
  await registerWithPromise(user, req.body.password);

  next();
}

exports.login = (req, res) => {
  res.render('login', {title: 'Log In'})
}
