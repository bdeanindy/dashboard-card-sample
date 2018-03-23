"use strict";

const crypto = require('crypto');
const request = require('request');
const CardModel = require('../models/card');

// Vars
const weeblyAPI  = process.env.MY_API_BASE_URI;

/**
 * Weebly Card
 */
const Card = module.exports = function(options = {}) {
    console.log('Instantiate New Card options argument: ', options);

    // Base Route for Card API
    this.APIBaseURL = `${weeblyAPI}/user/sites/${options.site_id}/cards`;

    this.app_id     = process.env.WEEBLY_CLIENT_ID;
    this.site_id    = options.site_id;
    this.user_id    = options.user_id;
    this.card_id    = options.card_id;
    this.card_data  = null;
    this.language   = null;
    this.name       = null;
    this.version    = null;
    this.headers    = {
        'X-Weebly-Access-Token': options.token,
        'Content-Type': 'application/json',
        'Accepts': 'application/vnd.weebly.v1+json'
    };
};

// Retrieve the card details from Weebly Card API: https://dev.weebly.com/card-api.html 
Card.prototype.getDetails = (cb) => {
    request({
            method: `GET`,
            url: `${this.APIBaseURL}/${this.card_id}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('getDetails response body: ', body);
                // TODO: Update instance properties
                cb(null, body);
            }
        }
    );
};

Card.prototype.update = (data, cb) => {
    request({
            method: `PATCH`,
            url: `${this.APIBaseURL}/${this.card_id}`,
            headers: this.headers,
            data: data
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, body);
            } else {
                console.log('update response body: ', body);
                cb(null, body);
            }
        }
    );
};

Card.prototype.refresh = (cb) => {
    request({
            method: `GET`,
            url: `${this.APIBaseURL}/${this.card_id}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('getDetails response body: ', body);
                this.card_id = body.card_id;
                this.name = body.name;
                this.hidden = body.hidden;
                this.card_data = body.card_data;
                this.language = body.language;
                this.version = body.version;
                cb(null, body);
            }
        }
    );
};
