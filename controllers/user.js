"use strict";

const crypto = require('crypto');
const request = require('request');
const User = require('../models/user');

// Vars
const weeblyAPI  = process.env.MY_API_BASE_URI;

/** TODO

* Create new user in DB
* Handle where we are storing stuff (in Mongo, or from API)

/**
 * Weebly User
 */
const User = module.exports = function(options = {}) {
    console.log('Instantiate New User options argument: ', options);

    // Base Route for User API
    this.APIBaseURL = `${weeblyAPI}/user`;
    this.appId      = process.env.WEEBLY_CLIENT_ID;
    this.userId     = options.user_id;
    this.headers    = {
        'X-Weebly-Access-Token': options.token,
        'Content-Type': 'application/json',
        'Accepts': 'application/vnd.weebly.v1+json'
    };
};

// Retrieve the card details from Weebly User API: https://dev.weebly.com/card-api.html 
User.prototype.details = (cb) => {
    request({
            method: `GET`,
            url: `${this.APIBaseURL}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('GET User Details response: ', body);
                cb(null, body);
            }
        }
    );
};
