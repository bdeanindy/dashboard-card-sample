"use strict";

// Sets up local development environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const WeeblyMiddleware = require('./middleware/weebly.js');
const oauthRouter = require('./controllers/oauth-router.js');
const webhooksRouter = require('./controllers/webhooks-router.js');
// TODO: INCLUDE A NEW FETCH USER CONTROLLER TO HANDLE POPULATING THE WEBHOOK

const index = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

/**
 * Create a new instance of WeeblyMiddleware.
 * The `client_id` and `secret_key` can be set either here
 * or in your environment variables (e.g. for Heroku)
 *
 * NOTE: If you have WEEBLY_CLIENT_ID and WEEBLY_SECRET_KEY
 * set in your environment, you can create the new WeeblyMiddleware
 * instance with `const wMiddleware = new WeeblyMiddleware()`
 *
 * @type {WeeblyMiddleware|exports|module.exports}
 */
const wMiddleware = new WeeblyMiddleware({
	'client_id': process.env.WEEBLY_CLIENT_ID,
	'secret_key': process.env.WEEBLY_CLIENT_SECRET
});

/**
 * Requires Weebly API KEYS to be set to access
 */
app.use('/oauth', wMiddleware, oauthRouter);
app.use('/webhooks', wMiddleware, webhooksRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
