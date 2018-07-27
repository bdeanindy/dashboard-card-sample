"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const HMAC_Util = require('../utils/hmac');
const mongoose = require('mongoose');
const MANIFEST = require('../manifest');
const CardController = require('../controllers/cardController'); // Handles both cards collection in DB, and Weebly Card API Interactions
//const EventController = require('../controllers/eventController'); TODO: Implement later
//const AppController = require('../controllers/appController'); TODO: Implement later

// Mongoose Models
let Event = require('../models/event'); // TODO: Move this into the eventController once implemented

/**
 * Verifies the event request came from Weebly
 */
const isValidWebhookRequest = (params = {}) => {
	if(!params) {
		return false;
	}

	// Verify data matches what we expect
	let comparisonObject = {
		'client_id': process.env.WEEBLY_CLIENT_ID,
		'client_version': MANIFEST.version,
		'event': params.body.event,
		'timestamp': params.body.timestamp,
		'data': params.body.data
	};

	// Build comparison string used to verify the event payload comes from Weebly
	let comparisonString = JSON.stringify(comparisonObject);
	if (!HMAC_Util.validateHmac(params.body.hmac, comparisonString, process.env.WEEBLY_CLIENT_SECRET)) {
		console.log('HMAC did not match, do not proceed!');
		return false;
	}

	console.log('HMAC matched, proceed...');
	return true;
};

/**
 * Callback URL as specified in `manifest.json`
 */
router.post('/callback', (req, res, next) => {
	console.log(`POST request received at ${req.path}\n`);
	console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
	console.log(`Data: ${JSON.stringify(req.body, null, 2)}`);

	// Validate event request from Weebly
	if(!isValidWebhookRequest(req)) {
		res.status(400).send(new Error('HMAC does not match'));
	}

	// Prepare event data for storage in the DB
	let newEventData = {
		client_id: req.body.client_id,
		client_version: req.body.client_version, 
		eventType: req.body['event'],
		weeblyTimestamp: req.body.timestamp,
		data: req.body['data'],
		hmac: req.body.hmac
	};

	// TODO: Replace this with eventController.js in the future
	// Instantiate /models/event.js
	let newEvent = new Event(newEventData);
	// Save the event in the DB
	newEvent.save((err, savedEvent) => {
		if(err) {
			console.error(err);
			res.status(500).send(new Error('Unable to save new event'));
		}
	});


	// TODO - Implement Mongoose Middleware POST Hooks to kickoff the right actions instead of doing this below...

	// Handle `dasboard.card.update` events
	if('dashboard.card.update' === req.body['event']) {
		console.log('New Dashboard Card Update Event...');
		// Send this request to cardController for handling
		CardController.handleUpdateEvent(req.body);
	}

	// Handle `app.uninstall` events
	if('app.uninstall' === req.body['event']) {
		console.log('App has been uninstalled, remove card from the DB');
		// Send this request to appController for handling
	}


		// Upsert card into DB: user_id, site_id, app_id, token, card_id, name, hidden, version, language, count, active, card_data
		/*
		Card.findOneAndUpdate({
				site_id: req.body.data.site_id,
				user_id: req.body.data.user_id}, 
			{
				user_id: req.body.data.user_id,
				site_id: req.body.data.site_id,
				name: req.body.data.name,
				app_id: req.body.data.platform_app_id,
				card_id: req.body.data.platform_dashboard_card_id,
				version: req.body.data.platform_dashboard_card_version, 
				language: req.body.data.language
			},
			{
				new: true,
				upsert: true,
				setDefaultsOnInsert: true
			})
		.then((updatedCard) => {
			
		// Update card in Weebly API if it already existed
			console.log(`Card from DB: ${updatedCard}`);
			if(updatedCard.card_data) {
				let cardDataFromDB = JSON.parse(updatedCard.card_data);
			}
			console.log(`cardDataFromDB: ${cardDataFromDB}`);
			if(cardDataFromDB.count) {
				let tmpCount = cardDataFromDB.count + 1;
			}
			// Update card in Weebly API
			let myCard = new CardAPI({
				app_id: updatedCard.app_id,
				site_id: updatedCard.site_id,
				user_id: updatedCard.user_id,
				card_id: updatedCard.card_id,
				card_data: updatedCard.card_data,
				language: updatedCard.language,
				name: updatedCard.name,
				version: updatedCard.version
			});
		})
		.catch((err) => {
			console.error(err);
		});
		*/

	// We don't want a bunch of retries, so respond positively to all events without errors
	res.status(200).send('Successfully received');
});

/**
 * @type Express.Router
 */
module.exports = router;
