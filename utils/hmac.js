"use strict";

var crypto = require('crypto');

let Utility = {};

/**
 * Helper function to validate Hmac
 * @param hmac
 * @param compareString
 * @param key
 * @returns {boolean}
 */
Utility.validateHmac = function(hmac, compareString, key) {
	console.log('Validating the HMAC');
	let digest = this.generateHmac(compareString, key);
	//console.log('Digest: ', digest);
	return (digest == hmac);
};

/**
 * Helper function to generate Hmac
 * @param string
 * @param key
 * @returns {*}
 */
Utility.generateHmac = function(string, key) {
	//console.log('Generating HMAC');
	let crypt = crypto.createHmac('sha256', new Buffer(key, 'utf-8'));
	crypt.update(string);
	//console.log('Preparing to return HMAC');
	return crypt.digest('hex');
};

module.exports = Utility;
