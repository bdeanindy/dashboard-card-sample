"use strict";

const crypto = require('crypto');
const request = require('request');
const CardModel = require('../models/card');

// Vars
const weeblyAPI  = process.env.WEEBLY_API_BASE_URI;

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
    this.name       = options.card_name;
    this.version    = null;
    this.headers    = {
        'X-Weebly-Access-Token': options.token,
        'Content-Type': 'application/json',
        'Accepts': 'application/vnd.weebly.v1+json'
    };

    if(options.initialize) {
        console.log('Should be initializing the Card...');
        return this.init(this.user_id, this.site_id, this.name, this.token);
    }
};

Card.prototype.init = (user = this.user_id, site = this.site_id, cardName = this.name, cardId = this.cardId, token) => {
    console.log('User: ', user);
    console.log('Site: ', site);
    console.log('Card Name: ', cardName);
    console.log('Card ID: ', cardId);
    if(!cardName && !cardId) {
        let errMsg = new Error(`Unable to initialize Card via API, must provide either CardID or CardName`);
        console.error(errMsg);
        throw errMsg;
    }

    let cardIdentifier = cardId || cardName;
    let baseURI = this.APIBaseURL;
    console.log('cardIdentifier in Card Controller.init(): ', cardIdentifier);
    console.log('baseURI: ', baseURI);

    try {
        request({
                method: `GET`,
                url: `${baseURI}/${cardIdentifier}`,
                headers: this.headers
            },
            function(err, response, body) {
                if(err) {
                    console.error(err);
                } else {
                    console.log('getDetails response body: ', body);
                    // TODO: Update instance properties
                    return(body);
                }
            }
        );
    } catch(err) {
        console.error(err);
        throw err;
    }
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
