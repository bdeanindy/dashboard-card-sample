"use strict";

const crypto = require('crypto');
const request = require('request');

// NOTE - WEEBLY API is ONLY FOR OPERATING WITH THE API DATA

// Vars
const weeblyApiBaseUrl  = process.env.WEEBLY_API_BASE_URI;

exports.getCardList = (options) => {
    return new Promise((resolve, reject) => {
        let cardEndpoint = `${weeblyApiBaseUrl}/user/sites/${options.site_id}/cards`;
        let requestOptions = {
            method: `GET`,
            url: cardEndpoint,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.weebly.v1+json',
                'X-Weebly-Access-Token': options.token
            }
        };
        request(requestOptions,
        function(err, response, body) {
            if(err) {
                console.error(err);
                return reject(err);
            } else {
                console.log('getList response body: ', body);
                resolve(body);
            }
        });
    });
};

// Retrieve the card details from Weebly Card API by card_id: https://dev.weebly.com/card-api.html 
exports.getCardById = (options) => {
    return new Promise((resolve, reject) => {
        let cardEndpoint = `${weeblyApiBaseUrl}/user/sites/${options.site_id}/cards/${options.card_id}`;
        request({
                method: `GET`,
                url: cardEndpoint,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.weebly.v1+json',
                    'X-Weebly-Access-Token': options.token
                }
            },
            function(err, response, body) {
                if(err) {
                    console.error('COULD NOT GET CARD BY ID: ', err);
                    return reject(err, body);
                } else {
                    console.log('getDetailsById response body: ', body);
                    return resolve(body);
                }
            }
        );
    });
};

// Retrieve the card details from Weebly Card API by name: https://dev.weebly.com/card-api.html 
exports.getCardByName = (options) => {
    return new Promise((resolve, reject) => {
        let cardEndpoint = `${weeblyApiBaseUrl}/user/sites/${options.site_id}/cards/${options.name}`;
        request({
                method: `GET`,
                url: cardEndpoint,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.weebly.v1+json',
                    'X-Weebly-Access-Token': options.token
                }
            },
            function(err, response, body) {
                if(err) {
                    console.error('COULD NOT GET CARD BY NAME: ', err);
                    return reject(err, body);
                } else {
                    console.log('getDetailsByName response body: ', body);
                    resolve(body);
                }
            }
        );
    });
};

exports.updateCard = (options = {}) => {
    return new Promise((resolve, reject) => {
        // TODO Improve this by using destructuring and spread params???
        console.log('Weebly Card API Request Data: ', options);
        if(!options.card_id || !options.token || !options.site_id || !options.data) {
            let updateErr = new Error('Missing one or more required arguments to weebly/card.update()');
            console.error(updateErr);
            reject(updateErr);
        }
        let cardEndpoint = `${weeblyApiBaseUrl}/user/sites/${options.site_id}/cards/${options.card_id}`;
        request({
                method: `PATCH`,
                url: cardEndpoint,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.weebly.v1+json',
                    'X-Weebly-Access-Token': options.token
                },
                data: options.data
            },
            function(err, response, body) {
                if(err) {
                    console.error(err);
                    return reject(err, body);
                } else {
                    console.log('update response body: ', body);
                    resolve(body);
                }
            }
        );
    });
};
