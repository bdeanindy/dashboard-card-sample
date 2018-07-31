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
		let err = new Error('Invalid dashboard card path variable.');
		console.error(err);
		res.status(400).send(err);
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
		if(!card) {
			// Sanity check
			// Handle no card in the db (which equates to: card not configured)
			res.render('welcomeCard', decoded);
		} else {
			/**
				Card From DB
				{
					hidden: false,
					version: '1.0.0',
					language: 'en-us',
					count: 1,
					active: true,
					data: [],
					_id: 5b5b92beeb7d2e93f2a9894e,
					card_data: [],
					card_id: '900749780762366038',
					name: 'helloworld',
					user_id: '110864487',
					site_id: '369681026904144169',
					createdAt: 2018-07-27T21:46:38.038Z,
					updatedAt: 2018-07-27T21:46:38.038Z,
					__v: 0
				}
			**/
			// Handle a card being returned
			// Cleanse out data we do not wish to expose for security reasons
			let cleansedCard = {
				name: card.name,
				data: card.data,
				user_id: card.user_id,
				site_id: card.site_id,
				count: card.count,
				createdAt: card.createdAt,
				lastUpdated: card.updatedAt
			};
			// Use the token on the front-end to handle updating the Card API there...??? (if not, should remove it to prevent bad habits)
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
		if(!body.user_id || !body.site_id || !req.params.name) {
			let err = new Error('Invalid or missing data: user_id, site_id must be provided in the body.');
			console.error(err);
			res.status(400).send(err);
		} else {
			// Configure this from the AJAX request on the client-side
			// TODO: Hard coding this, but in the future, we could have a list of components on the back-end or front-end which the user can create/configure dynamically
			CardController.configure({
				user_id: reqData.user_id,
				site_id: reqData.site_id,
				name: req.params.name
			})
			.then((configuredCard) => {
				console.log(`Configured Card: ${configuredCard}`);
			});
		}
	}

	console.log('Client site provided request data: ', reqData);

});

// This should only ever be displayed when a user clicks the "Get Started" button in the Welcome Component of the Dashboard Card
router.get('/welcome/:name/:jwt', function(req, res) {
	console.log(`Request received at: ${req.path}`);
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
		let err = new Error('Invalid dashboard card path variable.');
		console.error(err);
		res.status(400).send(err);
	}

	// TODO: DRY this out
	// Verify JWT came from the source we expect
	let decoded = JWT.verify(req.params.jwt, req.app.secretKey, {algorithms: "HS256", maxAge: "1h"}); // If this breaks, might need to pass the secretKey parameter as Base64 buffer: `Buffer.from(req.app.secretKey, 'base64')`
	console.log('DECODED JWT: ', decoded);

	// Handle errors validating the JWT
	if(!decoded) {
		// POTENTIAL SECURITY VULNERABILITY: Must not proceed if you cannot verify the JWT 
		let err = new Error(`Unable to verify the JWT, cannot proceed`);
		console.error(err);
		res.status(403).send(err);
	} else {
		// NOTE: Perform additional operations as needed
		// TODO: Must have a valid and active installation for this user/site, else display forbidden message
		res.render('welcomeCard', decoded);
	}
});

/**
 * @type Express.Router
 */
module.exports = router;
