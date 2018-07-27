"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const needle = require('needle');
const querystring = require('querystring');
const HMAC_Util = require('../utils/hmac');
const OAuth = require('../models/oauth');

// TODO: Simplify this by placing almost everything here into the OAuth Controller

/**
 * Initial OAuth endpoint as specified in `manifest.json`.
 */
router.get('/phase-one', function(req, res) {
	//console.log('Phase one of redirect has been initiated');

	const clientId = req.app.clientId;
	const secretKey = req.app.secretKey;

    // first, let's verify that our hmac is consistent with what was sent.
    let compareObj = {
		'user_id': req.query.user_id,
		'timestamp': req.query.timestamp,
		'site_id': req.query.site_id
	};
	let compareString = querystring.stringify(compareObj);

	if (!HMAC_Util.validateHmac(req.query.hmac, compareString, secretKey)) {
		let messages = [];
		//messages.push("The OAuth flow was started, but the hmac calculated didn't match the hmac passed.");
		//messages.push(`Expected: ${req.query.hmac}`);
		//messages.push(`Computed: ${HMAC_Util.generateHmac(compareString, secretKey)}`);
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

	// TODO: Find existing installation first
	OAuth.create({
		site_id: req.query.site_id,
		user_id: req.query.user_id,
		active: false,
		version: req.query.version,
		weebly_timestamp: req.query.timestamp
	}, (err, record) => {
		if(err) console.error(err);
		//console.log('Saved OAuth Phase One: ', record);
	});

	res.redirect(redirectUrl);
});

/**
 * Secondary OAuth endpoint as specified by `phaseTwoLink` in the phase one endpoint
 */
router.get('/phase-two', function(req, res) {
	//console.log(`\nPhase two of redirect has been initiated\n`);
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
		//console.log(`Inside needle callback`);
		if (error) {
			console.error(`\nPhase two failure: ${error}`);
			return res.status(500).send('failed');
		}

		let payload = JSON.parse(response.body);

		// we have the token. you can store this wherever
		req.app.token = payload.access_token;

		// Update the OAuth Item in Mongo
		let oauthQuery = { site_id: req.query.site_id, user_id: req.query.user_id};
		OAuth.findOneAndUpdate(oauthQuery, {token: payload.access_token, active: true})
		.then((install) => {
			console.log('We have a token!');
			console.log('Install: ', install);
			return install;
		})
		.catch((err) => {
			console.error(err);
			throw err;
		});

		//console.log(`\nAccess token: ${payload.access_token}`);
		//console.log(`\nPayload.callback_url: ${payload.callback_url}`);
		res.redirect(payload.callback_url);
	});
});

/**
 * @type Express.Router
 */
module.exports = router;
