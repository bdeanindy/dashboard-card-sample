"use strict";

const crypto = require('crypto');
const request = require('request');
const Site = require('../models/site');

// Vars
const weeblyAPI  = process.env.MY_API_BASE_URI;

/** TODO
* Create new user in DB
* Handle where we are storing stuff (in Mongo, or from API)
**/

/**
 * Weebly Site 
 */
const Site = module.exports = function(options = {}) {
    console.log('Instantiate New Site options argument: ', options);

    // Base Route for Site API
    this.APIBaseURL = `${weeblyAPI}/user/sites`;
    this.appId      = process.env.WEEBLY_CLIENT_ID;
    this.siteId     = options.site_id;
    this.userId     = options.user_id;
    this.headers    = {
        'X-Weebly-Access-Token': options.token,
        'Content-Type': 'application/json',
        'Accepts': 'application/vnd.weebly.v1+json'
    };
};

// Retrieve the card details from Weebly Site API: https://dev.weebly.com/card-api.html 
Site.prototype.getSites = (params = {}, cb) => {
    // TODO: Build out params filters and add to request if present
    request({
            method: `GET`,
            url: `${this.APIBaseURL}/${this.cardId}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('GET Site List response body: ', body);
                cb(null, body);
            }
        }
    );
};

Site.prototype.update = (data, cb) => {
    // TODO: Build out update data in request
    request({
            method: `PATCH`,
            url: `${this.APIBaseURL}/${data.siteId}`,
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

Site.prototype.getById = (siteId, cb) => {
    request({
            method: `GET`,
            url: `${this.APIBaseURL}/${siteId}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('getDetails response body: ', body);
                this.cardId = body.card_id;
                this.name = body.name;
                this.visible = body.hidden;
                this.cardData = body.card_data;
                cb(null, body);
            }
        }
    );
};
