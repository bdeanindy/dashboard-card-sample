"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const HMAC_Util = require('../utils/hmac');
const mongoose = require('mongoose');
const MANIFEST = require('../manifest');
const CardController = require('../controllers/card');

// Mongoose Models
let Card = require('../models/card');
let Event = require('../models/event');

/**
 * Callback URL as specified in `manifest.json`
 */
router.post('/callback', function(req, res, next) {
	console.log(`POST request received at /webhooks${req.path}\n`);
	//console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
	//console.log(`Data: ${JSON.stringify(req.body, null, 2)}`);

	// Verify data matches what we expect
	let comparisonObject = {
		'client_id': process.env.WEEBLY_CLIENT_ID,
		'client_version': MANIFEST.version,
		'event': req.body.event,
		'timestamp': req.body.timestamp,
		'data': req.body.data
	};
	let comparisonString = JSON.stringify(comparisonObject);
	if (!HMAC_Util.validateHmac(req.body.hmac, comparisonString, process.env.WEEBLY_CLIENT_SECRET)) {
		res.status(400).send(new Error('HMAC does not match'));
	}

	let newEventData = {
		client_id: req.body.client_id,
		client_version: req.body.client_version, 
		eventType: req.body['event'],
		weeblyTimestamp: req.body.timestamp,
		data: req.body['data'],
		hmac: req.body.hmac
	};
	let newEvent = new Event(newEventData);
	newEvent.save((err, savedEvent) => {
		if(err) console.error(err);
		console.log('Event saved: ', savedEvent);
	});

	// Handle `dasboard.card.update` events
	if('dashboard.card.update' === req.body['event']) {
		console.log('Dashboard Card Update Event...');

		/*
		Card.findOneAndUpdate({site_id: req.body.data.site_id, user_id: req.body.data.user_id}, {app_id: req.body.data.platform_app_id, card_id: platform_dashboard_card_id, version: platform_dashboard_card_version, language: req.body.data.language})
		.then((updatedCard) => {
			console.log('Card updated in DB. TODO: update it via Weebly API');
			let myCard = new CardController({
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
	}

	// Handle `app.uninstall` events
	if('app.uninstall' === req.body['event']) {
		console.log('App has been uninstalled, remove card from any cache');
	}

	// We don't want a bunch of retries, so respond positively to all events without errors
	res.status(200).send('Successfully received');
});

/**
 * @type Express.Router
 */
module.exports = router;
