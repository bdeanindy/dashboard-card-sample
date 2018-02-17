"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const HMAC_Util = require('../utils/hmac');
const Card = require('./card');

/**
 * Callback URL as specified in `manifest.json`
 */
router.post('/callback', function(req, res) {
	let messages = [];
	messages.push(`POST request sent to '/webhooks/callback'\n`);
	messages.push(`Token: ${req.app.token}\n`);

	let comparisonObject = {
		'client_id': req.body.client_id,
		'client_version': req.body.client_version,
		'event': req.body.event,
		'timestamp': req.body.timestamp,
		'data': req.body.data
	};

	let comparisonString = JSON.stringify(comparisonObject);

	// Verify the HMAC
	if (!HMAC_Util.validateHmac(req.body.hmac, comparisonString, req.app.secretKey)) {
		messages.push(`Fresh webhook received, but hmac does not match.`);
		messages.push(`Expected ${req.body.hmac}`);
		messages.push(`Calculated ${HMAC_Util.generateHmac(comparisonString)}`);
	} else {
		messages.push('Fresh webhook event recieved:');
		messages.push("\n");
	}

	messages.push(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
	messages.push(`Data: ${JSON.stringify(req.body, null, 2)}`);
	messages.push("\n");

	// We only want to update the card data when we receive the appropriate events, in this case: `dasboard.card.update` events
	if('dashboard.card.update' === req.body['event']) {
		//Dashboard Card Event Fields: ['user_id', 'site_id', 'platform_app_id', 'platform_dashboard_card_id', 'platform_dashboard_card_version', 'name', 'language'];
		messages.push(`Received update dashboard card event\n`);
		messages.push(`Full Request Body: ${req.body}\n`);
		messages.push(`Request Body Data Property: ${req.body.data}\n`);

		let eventData = req.body['event'];
		let sid = eventData.site_id;
		let cid = eventData.card_id;

		// If the site doesn't already exist, add it to cache and create the card
		if(!app.locals.siteCardCache[sid]) {
			app.locals.siteCardCache[sid] = {};
			app.locals.siteCardCache[sid][cid] = new Card({
				card_id: eventData.platform_dashboard_card_id,
				site_id: eventData.site_id,
				token: req.app.token
			});
		}

		// Get some more information about the card's state from the API
		let currentCard = app.locals.siteCardCache[sid][cid].getDetails();
		let tmpData = currentCard.card_data;

		// TODO: Process and Update Dashboard Card Data According to Event Shape
		// For this example, we are just going to bump the display count (since we only have defined a single data point in the `manifest.json` for this app)
		messages.push(`Previous display count was: ${tmpData[0].value}`);
		tmpData[0].value += 1;

		currentCard.update(tmpData, function(err, data) {
			if(err) {
				console.error(err, data);
			} else {
				console.log('Card Update Response Data: ', data);
			}
		});
		*/
	}

	let message = messages.join("\n");

	console.log('Messages: ', messages);
	res.status(200).send(message);

});

/**
 * @type Express.Router
 */
module.exports = router;
