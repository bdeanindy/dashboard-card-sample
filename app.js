"use strict";

// `dotenv` To Enable Local DevMachine Environment Vars
require('dotenv').config();

// EXPRESS APP DEPENDENCIES
const express			= require('express');
const path				= require('path');
const favicon			= require('serve-favicon');
const logger			= require('morgan');
const cookieParser		= require('cookie-parser');
const bodyParser		= require('body-parser');

// CUSTOM WEEBLY MIDDLEWARE AND ROUTERS
const WeeblyMiddleware	= require('./middleware/weebly.js');
const oauthRouter		= require('./routes/oauth.js');
const webhooksRouter	= require('./routes/webhooks.js');
const cardsRouter		= require('./routes/cards.js');

// MongoDB Connection
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native Node Promises

// BASE ROUTES
const index = require('./routes/index');

// Assign Express
const app = express();

// Setup View-Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Define Express Server Params
app.use(favicon(path.join(__dirname, 'public', 'favicons/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Must mount base router before all else
app.use('/', index);

/**
 * Create a new instance of WeeblyMiddleware.
 * The `client_id` and `clientSecret` can be set either here
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
  * Mount My Custom Middleware and Routers to the App
**/
app.use('/oauth', wMiddleware, oauthRouter);
app.use('/webhooks', wMiddleware, webhooksRouter);
app.use('/cards', wMiddleware, cardsRouter);

mongoose.connect('mongodb://' + process.env.MONGODB_USER + ':' + process.env.MONGODB_PW + '@' + process.env.MONGODB_HOST + ':' + process.env.MONGODB_PORT + '/' + process.env.MONGODB_DB)
	.then(() => console.log('connection successful'))
	.catch((err) => console.error(err))
	;

// Catch 404 forwards to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
