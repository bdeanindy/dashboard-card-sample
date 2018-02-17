"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const needle = require('needle');
const querystring = require('querystring');
const Utility = require('./utility');

/**
 * Initial OAuth endpoint as specified in `manifest.json`.
 */
router.get('/phase-one', function(req, res) {
	console.log('Phase one of redirect has been initiated');

	const clientId = req.app.clientId;
	const secretKey = req.app.secretKey;

    // first, let's verify that our hmac is consistent with what was sent.
    let compareObj = {
		'user_id': req.query.user_id,
		'timestamp': req.query.timestamp,
		'site_id': req.query.site_id
	};
	let compareString = querystring.stringify(compareObj);

	if (!Utility.validateHmac(req.query.hmac, compareString, secretKey)) {
		let messages = [];
		messages.push("The OAuth flow was started, but the hmac calculated didn't match the hmac passed.");
		messages.push(`Expected: ${req.query.hmac}`);
		messages.push(`Computed: ${Utility.generateHmac(compareString, secretKey)}`);
		let message = "\n" + messages.join("\n") + "\n";
		return res.status(500).send(message);
	}

	console.log(`\nA new installation for user id ${req.query.user_id}, site id ${req.query.site_id} has been initialized.\n`);

    // if we've reached this point, that means we're set. make a request to start the authorization process
	let phaseTwoLink = `https://${req.headers.host}/oauth/phase-two`;
	let callbackParams = {
		'client_id': clientId,
		'user_id': req.query.user_id,
		'site_id': req.query.site_id,
		'redirect_uri': phaseTwoLink
	};
	let paramsString = querystring.stringify(callbackParams);
	let redirectUrl = `${req.query.callback_url}?${paramsString}`;

	if(req.query.version) {
		redirectUrl += `&version=${req.query.version}`;
	}

	res.redirect(redirectUrl);
});

/**
 * Secondary OAuth endpoint as specified by `phaseTwoLink` in the phase one endpoint
 */
router.get('/phase-two', function(req, res) {
	console.log(`\nPhase two of redirect has been initiated\n`);
	//console.log(`Client ID on req.app.clientId: ${req.app.clientId}\n`);
	//console.log(`Client Secret on req.app.secretKey: ${req.app.secretKey}\n`);
	const clientId = req.app.clientId;
	const secretKey = req.app.secretKey;
	let accessToken;

    // we have our authorization code.
    // now we make a request toe xchange it for a token.
	needle.post(req.query.callback_url, {
		client_id: clientId,
		client_secret: secretKey,
		authorization_code: req.query.authorization_code
	}, function(error, response) {
		console.log(`Inside needle callback`);
		if (error) {
			console.error(`\nPhase two failure: ${error}`);
			return res.status(500).send('failed');
		}

		let payload = JSON.parse(response.body);

		// we have the token. you can store this wherever
		req.app.token = payload.access_token;

		console.log(`\nAccess token: ${payload.access_token}`);

		console.log(`\nPayload.callback_url: ${payload.callback_url}`);
		res.redirect(payload.callback_url);
	});
});

/**
 * @type Express.Router
 */
module.exports = router;
