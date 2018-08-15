"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const HMAC_Util = require('../utils/hmac');
const mongoose = require('mongoose');
const MANIFEST = require('../manifest');
const CardController = require('../controllers/cardController'); // Handles both cards collection in DB, and Weebly Card API Interactions
//const EventController = require('../controllers/eventController'); TODO: Implement later
const AppController = require('../controllers/appController'); // TODO: Implement later

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
	//console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
	//console.log(`Data: ${JSON.stringify(req.body, null, 2)}`);
	let responseCode = 200;
	let responseMessage = 'Successfully received';

	// Validate event request from Weebly
	if(!isValidWebhookRequest(req)) {
		responseCode = 400;
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

	// Create New Event Object for the DB
	let newEvent = new Event(newEventData);
	// Save event to the DB
	newEvent.save((err, savedEvent) => {
		if(err) {
			console.error(err);
			res.status(500).send(new Error('Unable to save new event'));
		} else {
			console.log(`Event saved to MongoDB: ${savedEvent}`);
		}
	});


	// TODO - Improve by implementing Mongoose Middleware POST Hooks to kickoff the right actions instead of doing this below...

	// Handle `dasboard.card.update` events
	if('dashboard.card.update' === req.body['event']) {
		console.log(`New Dashboard Card Update Event received: ${req.body}`);
		// Send this request to cardController for handling
		CardController.handleUpdateEvent(req.body)
		.then((updatedCard) => {
			console.log('Updated after `dashboard.card.update` event received: ', updatedCard);
		})
		.catch((e) => {
			console.error(e);
			throw e;
		});
	}

	// Handle `app.uninstall` events
	if('app.uninstall' === req.body['event']) {
		//console.log('App has been uninstalled, remove card from the DB');
		// Send this request to appController for handling
		AppController.uninstall(req.body)
		.then((uninstalledApp) => {
			console.log('Uninstalled App: ', uninstalledApp);
		})
		.catch((e) => {
			console.error(e);
			throw e;
		});
	}

	if('user.update' === req.body['event']) {
		// Send this request to userController for handling
		UserController.handleUpdateEvent(req.body);
	}

	// TODO: Improve this by using a proper retry-logic at a later time, but for now, always respond positively to prevent retries
	if(200 !== responseCode) {
		res.status(responseCode).send(new Error(responseMessage));
	} else {
		res.status(responseCode).send(responseMessage);
	}
});

/**
 * @type Express.Router
 */
module.exports = router;
