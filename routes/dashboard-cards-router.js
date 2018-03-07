"use strict";

const Card = require('../models/card');
const fs = require('fs');
const JWT = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');
const router = require('express').Router();
const manifest = require('../manifest');

/** TODO
	* Abstract JWT into its own module
	* Use Promises (or async/await) over callbacks
**/

/**
 * Callback URL as specified in `manifest.json`
 */
router.get('/setup/:name/:jwt', function(req, res, next) {
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

	// Verify the JWT
	let decoded = JWT.verify(req.params.jwt, req.app.secretKey, {algorithms: "HS256", maxAge: "1h"}); // If this breaks, might need to pass the secretKey parameter as Base64 buffer: `Buffer.from(req.app.secretKey, 'base64')`

	// Handle error validating JWT
	if(!decoded) {
		// POTENTIAL SECURITY VULNERABILITY: Must not proceed if you cannot verify the JWT 
		let err = new Error(`Unable to verify the JWT, cannot proceed`);
		console.error(err);
		res.status(403).send(err);
	}

	// TODO: Load from DB or create if it does not exist
	Card.findOne({
		site_id: decoded.site_id,
		user_id: decoded.user_id,
		name: req.params.name
	})
	.then((card) => {
		if(!card) {
			// Prepare data needed to create a new Card
			let newCardData = {
				name: req.params.name,
				user_id: decoded.user_id,
				site_id: decoded.site_id,
				token: req.app.token
			};
			let newCard = new Card(newCardData);
			return newCard.save();
		} else {
			console.log('Card Exists in DB: ', card);
			return card;
		}
	})
	.then((card) => {
		res.render('manageCard', card);
	})
	.catch((err) => {
		console.error(err);
		throw err;
	});
	/*
	currentCard.refresh((err, data) => {
		if(err) {
			console.error(err);
			res.status(err.statusCode).send(err);
		} else {
			console.log('Refreshed Data: ', data);
			// Success, render the dashboard card management UI
			res.render('manageCard', {
				user: decoded.user_id,
				site: decoded.site_id,
				jti: decoded.jti,
				iat: decoded.iat,
				card: data.name
			});
		}
	});
	*/
});

router.get('/welcome/:name/:jwt', (req, res, next) => {
	// We must have a card name in the route to match up webhook events later
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

	// Verify the JWT
	let decoded = JWT.verify(req.params.jwt, req.app.secretKey, {algorithms: "HS256", maxAge: "1h"}); // If this breaks, might need to pass the secretKey parameter as Base64 buffer: `Buffer.from(req.app.secretKey, 'base64')`

	// Handle error validating JWT
	if(!decoded) {
		// POTENTIAL SECURITY VULNERABILITY: Must not proceed if you cannot verify the JWT 
		let err = new Error(`Unable to verify the JWT, cannot proceed`);
		console.error(err);
		res.status(403).send(err);
	}
	// TODO: Determine if user already exists
	// TODO: If user exists, load their data
	// Render the Welcome view (per Weebly Design Considerations: https://dev.weebly.com/welcome-component.html
	res.render('welcomeCard', {
		user: decoded.user_id,
		site: decoded.site_id,
		jti: decoded.jti,
		iat: decoded.iat,
		card: process.env.WEEBLY_DASHBOARD_CARD_LABEL
	});
});

/**
 * @type Express.Router
 */
module.exports = router;
