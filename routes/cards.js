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
		if(!card) {
			// Card is not configured (or does not exist in the DB yet), render the Welcome View
			res.render('welcomeCard', decoded);
		} else {
			// Strip data we do not wish to expose for security reasons
			let cleansedCard = {
				name: card.name,
				data: card.data,
				user_id: card.user_id,
				site_id: card.site_id,
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

/**
 * @type Express.Router
 */
module.exports = router;
