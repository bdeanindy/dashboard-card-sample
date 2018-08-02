"use strict";

const JWT = require('jsonwebtoken');
const CardController = require('../controllers/cardController');
//const OAuth = require('../models/oauth');
const router = require('express').Router();

/**
 * Callback URL as specified in `manifest.json`
 */

// NOTE: Users can reach this without having a configured dashboard card (in that case, we should show them the Welcome View)
router.get('/manage/:name/:jwt', (req, res, next) => {
	// Card name required to match up webhook events later
	if(!req.params.name) {
		let err = new Error('Invalid request, cardName path variable is required.');
		console.error(err);
		res.status(400).send(err);
	}

	// We must have a JWT in order to lookup the Dashboard Card's configurations for the user
	if(!req.params.jwt) {
		let err = new Error('Invalid request, JWT path variable is required.');
		console.error(err);
		res.status(400).send(err);
	}

	// The card name must be valid and known by the app
	if(!req.params.name || process.env.WEEBLY_DASHBOARD_CARD_NAME !== req.params.name) {
		let err = new Error('Invalid dashboard card name provided in request.');
		console.error(err);
		res.status(404).send(err);
	}

	// TODO: Abstract JWT verification into its own module to DRY this out
	// Verify JWT came from the source we expect
	let decoded = JWT.verify(req.params.jwt, req.app.secretKey, {algorithms: "HS256", maxAge: "1h"}); // If this breaks, might need to pass the secretKey parameter as Base64 buffer: `Buffer.from(req.app.secretKey, 'base64')`
	console.log('DECODED JWT: ', decoded);

	// Handle errors validating the JWT
	if(!decoded) {
		// POTENTIAL SECURITY VULNERABILITY: Must not proceed if you cannot verify the JWT 
		let err = new Error(`Unable to verify the JWT, cannot proceed`);
		console.error(err);
		res.status(403).send(err);
	}

	// Does a card exist in the DB already, if yes, use it, otherwise we are dealing with a new card
	CardController.manage({
		user_id: decoded.user_id,
		site_id: decoded.site_id,
		name: req.params.name
	})
	.then((card) => {
		console.log('card: ', card);
		if(!card || !card.configured) {
			// Card is not configured (or does not exist in the DB yet), render the Welcome View
			res.render('welcomeCard', decoded);
		} else {
			// Strip data we do not wish to expose for security reasons
			let cleansedCard = {
				name: card.name,
				data: card.data,
				user_id: card.user_id,
				site_id: card.site_id,
				card_id: card.card_id,
				count: card.count,
				createdAt: card.createdAt,
				lastUpdated: card.updatedAt
			};
			res.render('manageCard', {card: cleansedCard});
		}
	})
	.catch((e) => {
		console.error(e);
		throw e;
	});
});

// AJAX Request Handler - Used for configuring dashboard card content beyond the Welcome Component in the Dashboard Card
router.post('/configure/:name', function(req, res) {
	console.log(`Request received at: ${req.path}`);

	// Reject if we don't have the data we need
	if(!req.body) {
		let missingBodyErr = new Error('Invalid Request: Body must be supplied');
		res.status(400).send(missingBodyErr);
	} else {
		let body = req.body;
		//console.log('BODY: ', body);
		if(!body.user_id || !body.site_id || !req.params.name) {
			let err = new Error('Invalid or missing data: user_id, site_id must be provided in the body.');
			console.error(err);
			res.status(400).send(err);
		} else {
			// Configure this from the AJAX request on the client-side
			// TODO: Hard coding this, but in the future, we could have a list of components on the back-end or front-end which the user can create/configure dynamically
			CardController.configure({
				user_id: body.user_id,
				site_id: body.site_id,
				name: req.params.name
			})
			.then((configuredCard) => {
				console.log(`Configured Card: ${configuredCard}`);
				// TODO: Might need to cleanse this before returning to the client.
				res.status(200).send(configuredCard);
			});
		}
	}
});

/**
getDetailsByName response body:  {"card_id":"900749780762366038","card_version":"2.0.0","name":"helloworld","hidden":0,"data":"[[{\"type\":\"welcome\",\"headline\":\"Hello World!\",\"text\":\"Setup your Hello World Dashboard Card in one easy step!\",\"action_label\":\"Get Started\",\"action_link\":\"https:\\\/\\\/weebly.apihacker.com\\\/cards\\\/manage\\\/helloworld\\\/:jwt\"}]]"}
Installation:  { active: true,
  _id: 5b60dcb45fb6dbf77badbf4e,
  site_id: '369681026904144169',
  user_id: '110864487',
  version: '3.0.0',
  weebly_timestamp: '1533074612',
  createdAt: 2018-07-31T22:03:32.566Z,
  updatedAt: 2018-07-31T22:03:33.526Z,
  __v: 0,
  token: 'OTJkNjcwZTBhY2E4NTdmZDMxZTYtMTEwODY0NDg3' }
DB Card:  { hidden: false,
  version: '2.0.0',
  language: 'en-us',
  count: 0,
  configured: false,
  active: true,
  data:
   [ '[[{"type":"welcome","headline":"Hello World!","text":"Setup your Hello World Dashboard Card in one easy step!","action_label":"Get Started","action_link":"https:\\/\\/weebly.apihacker.com\\/cards\\/manage\\/helloworld\\/:jwt"}]]' ],
  _id: 5b60dcb65fb6dbf77badbf50,
  card_id: '900749780762366038',
  name: 'helloworld',
  user_id: '110864487',
  site_id: '369681026904144169',
  createdAt: 2018-07-31T22:03:34.945Z,
  updatedAt: 2018-07-31T22:03:34.945Z,
  __v: 0 }
Data from the API Card:  { card_id: '900749780762366038',
  card_version: '2.0.0',
  name: 'helloworld',
  hidden: 0,
  data: '[[{"type":"welcome","headline":"Hello World!","text":"Setup your Hello World Dashboard Card in one easy step!","action_label":"Get Started","action_link":"https:\\/\\/weebly.apihacker.com\\/cards\\/manage\\/helloworld\\/:jwt"}]]' }
getList response body:  {"quote":"The 'morality of compromise' sounds contradictory. Compromise is usually a sign of weakness, or an admission of defeat. Strong men don't compromise, it is said, and principles should never be compromised.","author":"Andrew Carnegie","cat":"men"}
New Quote: <strong>&ldquo;</strong>undefined<strong>&rdquo;</strong><br /><em>&mdash; undefined &mdash; Category: undefined</em><p>Quote data courtesty of: <a href="https://talaikis.com/random_quotes_api/" title="Random Quotes API">Random Quotes API</a></p>
Ummm...fix your client side code, should NOT expose the 'configure' route in already configured dashboard cards
Error: Invalid request, cannot configure already configured dashboard cards
    at Object.exports.configure (/Users/benjamin/MY_APPS/weebly-dashboard-card-tutorial-app/controllers/cardController.js:165:19)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
(node:65486) UnhandledPromiseRejectionWarning: Error: Invalid request, cannot configure already configured dashboard cards
    at Object.exports.configure (/Users/benjamin/MY_APPS/weebly-dashboard-card-tutorial-app/controllers/cardController.js:165:19)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
(node:65486) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:65486) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
^C

**/

/**
 * @type Express.Router
 */
module.exports = router;
