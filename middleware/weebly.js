"use strict";

const express = require('express');

/**
 * Simple middleware which requires WEEBLY_CLIENT_ID
 * and WEEBLY_SECRET_KEY to be set before continuing
 *
 * @param options
 * @returns {Function}
 * @constructor
 */
let WeeblyMiddleware = function(options) {
	let clientId = process.env.WEEBLY_CLIENT_ID || options.client_id;
	let secretKey = process.env.WEEBLY_CLIENT_SECRET || options.secret_key;

	// TODO Construct list of dynamic URIs where we accept CORS headers from (based on installed DBCard apps)
	// Example URL for referer: https://www.weebly.com/app/home/users/110864487/sites/369681026904144169/dashboard
	let allowedOrigins = ['https://www.weebly.com', 'https://editmysite.com', 'https://www.weebly.com/app/home/users/110864487/sites/369681026904144169/dashboard'];

	return function(req, res, next) {
		if (!clientId) {
			throw "Client ID must be defined";
		}

		if (!secretKey) {
			throw "Secret Key must be defined";
		}

		req.app.clientId = clientId;
		req.app.secretKey = secretKey;

		if(allowedOrigins.indexOf(req.headers.referer)) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.referer);
			res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
			res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accepted');
			res.header('Access-Control-Allow-Credentials', true);
			res.header('X-FRAME-OPTIONS', 'ALLOW-FROM', req.headers.referer);
		}

		next();
	};
};

module.exports = WeeblyMiddleware;
