"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const JWT = require('jsonwebtoken');
const Card = require('./card');

/**
 * Callback URL as specified in `manifest.json`
 */
router.get('/setup/:cardName/:jwt', function(req, res) {
	let messages = [];
	let reqJWT = req.params.jwt;
	let cardName = req.params.cardName;
	//console.log(`GET request to '/cards/setup/:JWT'`);
	//console.log(`\n`);
	//console.log(`Token: ${req.app.token}`);
	//console.log(`\n`);
	//console.log(`Request.JWT: ${req.params.jwt}\n`);

	// We must have a JWT in order to lookup the Dashboard Card's configurations for the user
	if(!reqJWT && !cardName) {
		let err = new Error('GET request to `/cards/setup/:jwt` is missing the required JWT');
		console.error(err);
		res.status(400).send(err);
	} else {
		// Invalidate the JWT
		let decoded = JWT.verify(reqJWT, req.app.secretKey, {algorithms: "HS256", maxAge: "1h"}); // If this breaks, might need to pass the secretKey parameter as Base64 buffer: `Buffer.from(req.app.secretKey, 'base64')`
		if(!decoded) {
			console.error('Unable to decode the JWT');
			res.status(403).send('Unable to decode the JWT');
		} else {
			console.log(`Decoded JWT: ${decoded}`);
			// TODO: Lookup user and site
			// TODO: Load existing configurations
			// TODO: Load the UI with data if configurations exist
			// TODO: Else load the UI to be configured

			if( cardName !== process.env.WEEBLY_DASHBOARD_CARD_NAME ) {
				console.error('Unknown Dashboard Card, cannot proceed');
				res.status(400).send('Unknown Dashboard Card, cannot proceed');
			}
			res.render('manageCard', {
				user: decoded.user_id,
				site: decoded.site_id,
				jti: decoded.jti,
				iat: decoded.iat,
				card: cardName
			});
		}
	}
});

/**
 * @type Express.Router
 */
module.exports = router;
