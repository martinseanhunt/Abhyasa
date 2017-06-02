const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');
const path = require('path');
const flash = require('connect-flash')
const errorHandlers = require('./handlers/errorHandlers.js');
const helpers = require('./helpers/helpers.js');
const passport = require('passport');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const promisify = require('es6-promisify');
const routes = require('./routes/routes');
require('./handlers/passport');

// Create app
const app = express();

// Log HTTP requests
app.use(morgan('common'));

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/moment', express.static(__dirname + '/node_modules/moment/min/'));


// Use body parser so we can get posted data etc in request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use validator which gives us loads of validation funcitons to use anywhere
app.use(expressValidator());

// Set up sessions for user and flashes
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET, 
  key: process.env.KEY,
  resave: false, 
  saveUninitialized: false, 
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Use flashes for errors which will pass the errors to the next requested page
app.use(flash());

// Middleware to pass stuff to templates and all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  next();
});

// Send requests to routes
app.use('/', routes);

// If no route is found or we get nexted from within the route, it goes to error hanlers

// start with 404 error
app.use(errorHandlers.notFound);

// check if its a Mongo validation error, if so show a flash
app.use(errorHandlers.flashValidationErrors);

// if we're in dec, show the full error + stacktrace 
if (app.get('env') === 'dev') {
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;