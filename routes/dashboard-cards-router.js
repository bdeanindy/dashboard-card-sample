"use strict";

const Card = require('../models/card');
const fs = require('fs');
const JWT = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');
const router = require('express').Router();
const manifest = require('../manifest');
const CardAPI = require('../controllers/card');

/** TODO
	* Abstract JWT into its own module
	* Use Promises (or async/await) over callbacks
**/

/**
 * Callback URL as specified in `manifest.json`
 */
router.get('/manage/:name/:jwt', function(req, res) {
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

	// First, try to load from the DB 
	Card.findOne({
		site_id: decoded.site_id,
		user_id: decoded.user_id,
		name: req.params.name
	})
	.exec()
	.then((card) => {
		console.log('Card retrieved from the DB, continuing...');
		if(!card) {
			console.log('Must be a new DBCard/User so create a card in the DB');
			// Create a new placeholder Card in Mongo if we cannot find any for the user and site provided
			let newCardData = {
				app_id: req.app.clientId,
				name: req.params.name,
				user_id: decoded.user_id,
				site_id: decoded.site_id,
				count: 1,
				token: req.app.token,
				hidden: false,
				language: 'en-us',
				version: manifest.dashboard_cards[0].version
			};
			let newCard = new Card(newCardData);
			return newCard.save();
		} else {
			return card;
		}
	})
	.then((card) => {
		console.log('Card is: ', card);
		console.log('Should be rendering the `manageCard` view now...');

		res.render('manageCard', {
			cardName: card['name'],
			cardUser: card['user_id'],
			cardSite: card['site_id'],
			cardHide: card['hidden'], 
			cardlang: card['language'],
			cardVers: card['version'],
			cardData: card['card_data']
		});
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

router.get('/update/:name', function(req, res) {
	// Reject if we don't have the data we need
	if(!req.query.user || !req.query.site || !req.query.card) {
		let err = new Error('Invalid Request: Must supply valid: user, site, and card IDs.');
		console.error(err);
		res.status(400).send(err);
	}

	// Placeholder
	let apiCard = new CardAPI({
		card_id: req.query.card,
		user_id: req.query.user,
		site_id: req.query.site 
	});

	// Load from the DB, could be done in the controller
	let target = Card.findOne({
		site_id: decoded.site_id,
		user_id: decoded.user_id,
		name: req.params.name
	})
	.exec()
	.then((card) => {
		let cardDataStatIndex = card.card_data.findIndex(function(element) {
			return 'stat' === element.type && 'Counter' === element.primary_label;
		});
		card.card_data[cardDataStatIndex].primaryValue += 1;

		// TODO: Really really really need to replace these callbacks with Promise or async/await
		apiCard.update({
			card_data: card.card_data
		}, function(err, updatedResponse) {
			if(err) {
				console.error(err);
				res.send(err);
			} else {
				console.log('Updated in the API:', updatedResponse);
				card.save();
				res.status(200).send({count: card.card_data[cardDataStatIndex].primaryValue});
			}
		});
	})
	.catch((err) => {
		console.error(err);
		throw err;
	});

});

/**
 * @type Express.Router
 */
module.exports = router;
