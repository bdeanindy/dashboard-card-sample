"use strict";

const crypto = require('crypto');
const request = require('request');
//const WebhookModel = require('../models/webhook');

// Vars
const weeblyAPI  = process.env.MY_API_BASE_URI;

/**
 * Weebly Webhook
 */
const Webhook = module.exports = function(options = {}) {
    console.log('Instantiate New Webhook options argument: ', options);

    // Base Route for Webhook API
    this.APIBaseURL = `${weeblyAPI}/webhooks`;

    this.app_id         = process.env.WEEBLY_CLIENT_ID;
    this.site_id        = options.site_id;
    this.user_id        = options.user_id;
    this.webhook_id     = null;
    this.callback_url   = options.callback_url;
    this.event          = options.event;
    this.eventHeaders   = options.headers; // Received in Webhook Event Request
    // Used to form request to Weebly API
    this.headers        = {
        'X-Weebly-Access-Token': options.token,
        'Content-Type': 'application/json',
        'Accepts': 'application/vnd.weebly.v1+json'
    };
};

// Create new Webhook for site
Webhook.prototype.create = (options = {}, cb) => {
    let requestBody = {};
    requestBody.events = options.event || this.event;
    requestBody.callback_url = options.callback_url || this.callback_url;
    // TODO: Does it make sense for this to be set here since these are received in the event request from Weebly? Create a Jira issue if not needed here.
    //let eventHeaders = options.eventHeaders || this.eventHeaders;
    request({
            method: `POST`,
            url: `${this.APIBaseURL}`,
            headers: this.headers,
            body: JSON.stringify(requestBody)
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('POST Webhook response body: ', body);
                cb(null, body);
            }
        }
    );
};

// Retrieve list of Webhooks from the API
Webhook.prototype.getList = (cb) => {
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
                console.log('GET Webhook List response body: ', body);
                cb(null, body);
            }
        }
    );
};

// Retrieve the card details from Weebly Webhook API: https://dev.weebly.com/card-api.html 
Webhook.prototype.getById = (cb) => {
    request({
            method: `GET`,
            url: `${this.APIBaseURL}/${this.webhook_id}`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('GET Webhook response body: ', body);
                cb(null, body);
            }
        }
    );
};

// TODO: NEEDS DATA IN REQUEST!!!
Webhook.prototype.update = (options, cb) => {
    let requestBody = {};
    requestBody.event = options.event || this.event;
    requestBody.callback_url = options.callback_url || this.callback_url;
    request({
            method: `PATCH`,
            url: `${this.APIBaseURL}/${this.webhook_id}`,
            headers: this.headers,
            body: JSON.stringify(requestBody)
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('PATCH Webhook response body: ', body);
                cb(null, body);
            }
        }
    );
};

Webhook.prototype.remove = (cb) => {
    // TODO: Create Jira issue to update the docs and remove the trailing slash if it is not required
    // TODO: Create Jira issue, since there should be a response
    request({
            method: `DELETE`,
            url: `${this.APIBaseURL}/${this.webhook_id}/`,
            headers: this.headers
        },
        function(err, response, body) {
            if(err) {
                console.error(err);
                cb(err, data);
            } else {
                console.log('DELETE Webhook response body: ', body);
                cb(null, body);
            }
        }
    );
};
