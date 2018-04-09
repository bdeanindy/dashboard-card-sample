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

	// Verify the JWT
	let decoded = JWT.verify(req.params.jwt, req.app.secretKey, {algorithms: "HS256", maxAge: "1h"}); // If this breaks, might need to pass the secretKey parameter as Base64 buffer: `Buffer.from(req.app.secretKey, 'base64')`

	// Handle error validating JWT
	if(!decoded) {
		// POTENTIAL SECURITY VULNERABILITY: Must not proceed if you cannot verify the JWT 
		let err = new Error(`Unable to verify the JWT, cannot proceed`);
		console.error(err);
		res.status(403).send(err);
	}

	// GET CARD FROM THE API
	let cardViaApi = new CardAPI({
		site_id: decoded.site_id,
		user_id: decoded.site_id,
		card_name: req.params.name,
		initialize: true,
		token: req.app.token // TODO: Replace with more flexible version of this later
	});
	// DETERMINE STATE FROM card_data
	// HIDE LOADER
	// PRESENT TO USER

	// First, try to load from the DB 
	Card.findOne({
		site_id: decoded.site_id,
		user_id: decoded.user_id,
		name: req.params.name
	})
	.exec()
	.then((card) => {
		//console.log('Card retrieved from the DB, continuing...');
		if(!card) {
			//console.log('Must be a new DBCard/User so create a card in the DB');
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
		let count;
		console.log('Card is: ', card);
		console.log('Should be rendering the `manageCard` view now...');

		if(card['card_data'] && card['card_data'][0] && card['card_data'][0]['primary_label']) {
			count = card['card_data'][0]['primary_label']
				? card['card_data'][0]['primary_label']
				: 0
				;
		} else {
			count = 0;
		}

		res.render('manageCard', {
			token: card['token'],
			appId: card['app_id'],
			cardId: card['card_id'],
			cardName: card['name'],
			cardUser: card['user_id'],
			cardSite: card['site_id'],
			cardHide: card['hidden'], 
			cardData: card['card_data'],
			cardLang: card['language'],
			cardVers: card['version'],
			cardCount: count
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

router.post('/update/:name', function(req, res) {
	console.log('/update/{{name}} route called');
	// Reject if we don't have the data we need
	let reqData = req.body;
	if(!reqData.user || !reqData.site || !reqData.card) {
		let err = new Error('Invalid Request: Must supply valid: user, site, card ID, and target amount to update the stat component.');
		console.error(err);
		res.status(400).send(err);
	}

	console.log('Client site provided request data: ', reqData);

	// Placeholder
	let apiCard = new CardAPI({
		card_id: reqData.card,
		user_id: reqData.user,
		site_id: reqData.site 
	});

	let cardData = [
		{
			type: 'stat',
			value: 'My Stat',
			primary_value: reqData.targetCount,
			primary_label: 'of stats'
		}
	];

	// Load from the DB, could be done in the controller
	let target = Card.findOne({
		site_id: decoded.site_id,
		user_id: decoded.user_id,
		name: req.params.name
	})
	.exec()
	.then((card) => {
		if(!card) {
			// We don't have a card in our DB (shouldn't be possible, but handle it as an error
			res.status(404).send('Card for user and site not found');
		} else {
		}
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
