"use strict";

const request = require('request');

// NOTE - Quote API is a free quote service

// Vars
const apiBaseUrl  = process.env.QUOTE_API_BASE_URL;

exports.getQuote = (options) => {
    return new Promise((resolve, reject) => {
        let endpoint = `${apiBaseUrl}/api/quotes/random/`;
        let requestOptions = {
            method: `GET`,
            url: cardEndpoint,
            headers: {
                'Accept': 'application/json'
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
