"use strict";

const crypto = require('crypto');
const request = require('request');

// Vars
const weeblyAPI  = process.env.MY_API_BASE_URI;
const clientId   = process.env.MY_CLIENT_ID;
const secretKey  = process.env.MY_CLIENT_SECRET;

/**
 * Weebly Card
 */
const Card = module.exports = function(options = {}) {
    this.cardId = options.card_id;
    this.siteId = options.site_id;
    this.token = options.token;
    this.APIBaseURL = `${weeblyAPI}/user/sites/${siteId}/cards`;
    this.headers = {
        'X-Weebly-Access-Token': options.token,
        'Content-Type': 'application/json',
        'Accepts': 'application/vnd.weebly.v1+json'
    };
};

// Retrieve the card details from Weebly Card API: https://dev.weebly.com/card-api.html 
Card.getDetails = (cb) => {
    request({
            method: `GET`,
            url: `${this.APIBaseURL}/${cardId}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('getDetails response body: ', body);
                cb(null, body);
            }
        }
    );
};

// TODO: NEEDS DATA IN REQUEST!!!
Card.update = function (data, cb) {
    request({
            method: `PATCH`,
            url: `${this.APIBaseURL}/${this.cardId}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('update response body: ', body);
                cb(null, body);
            }
        }
    );
};

// TODO: NEEDS DATA IN REQUEST!!!
Card.toggleVisibility = function (visibile, cb) {
    request({
            method: `PATCH`,
            url: `${this.APIBaseURL}/${this.cardId}`,
            headers: this.headers,
            data: {
                hidden: visible
            }
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('update response body: ', body);
                cb(null, body);
            }
        }
    );
};

/**
 * @type Express.Router
 */
module.exports = Card;
