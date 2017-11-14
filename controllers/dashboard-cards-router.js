"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Utility = require('./utility');
const Card = require('./card');

/**
 * Callback URL as specified in `manifest.json`
 */
router.post('/callback', function(req, res) {
	console.log(`\n`);
	console.log(`POST request sent to '/webhooks/callback'`);
	console.log(`\n`);
	console.log(`Token: ${req.app.token}`);
	console.log(`\n`);
	//console.log(`Request.SOMETHING: ${req}\n`);
	let comparisonObject = {
		'client_id': req.body.client_id,
		'client_version': req.body.client_version,
		'event': req.body.event,
		'timestamp': req.body.timestamp,
		'data': req.body.data
	};

	let comparisonString = JSON.stringify(comparisonObject);

	let messages = [];

	messages.push("\n");

    // validate the hmac to see if its correct
	if (!Utility.validateHmac(req.body.hmac, comparisonString, req.app.secretKey)) {
		messages.push(`Fresh webhook was received, but the calculated hmac does not match what was passed.`);
		messages.push(`Expected ${req.body.hmac}`);
		messages.push(`Calculated ${Utility.generateHmac(comparisonString)}`);
	} else {
		messages.push('A fresh webhook was recieved:');
	}

	//{\n  "client_id": "465279841",\n  "client_version": "1.0.1",\n  "event": "dashboard.card.update",\n  "timestamp": 1503029424,\n  "data": {\n    "user_id": "108919051",\n    "site_id": "247763368794122525",\n    "platform_app_id": "465279841",\n    "platform_dashboard_card_id": "528166133822187070",\n    "platform_dashboard_card_version": "1.0.1",\n    "name": "devrel-interview",\n    "language": "en"\n  },\n  "hmac": "832035fade569f7a28ff27fcd16556d74d4e02cc396bcf3692ebd6727376f142"\n}
	messages.push(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
	messages.push(`Data: ${JSON.stringify(req.body, null, 2)}`);

	messages.push("\n");

	// We only want to update the card data when we receive the appropriate events, in this case: `dasboard.card.update` events
	if('dashboard.card.update' === req.body['event']) {
		messages.push(`Received update dashboard card event`);
		messages.push("\n");
		messages.push(`Full Request Body: ${req.body}`);
		messages.push("\n");
		messages.push(`Request Body Data Property: ${req.body.data}`);
		messages.push("\n");

		let configObj = {};
		// TODO: Bolt on the configObj properties from the event payload as context (so we update the correct dashboard card)

		/*
		Card.populateCard(function(err, data) {
			if(err) {
				console.error(err, data);
			} else {
				//console.log('User Data: ', user);
				res.render('reseller', {
					title: 'Manage Reseller User',
					resellerId: '',
					resellerTestMode: data.test_mode,
					resellerEmail: data.email, 
					resellerLanguage: data.language 
				});
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
