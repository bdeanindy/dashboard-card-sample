"use strict";

const request = require('request');

// NOTE - WEEBLY API is ONLY FOR OPERATING WITH THE API DATA

// Vars
const weeblyApiBaseUrl  = process.env.WEEBLY_API_BASE_URI;

exports.getUser = (userId) => {
    return new Promise((resolve, reject) => {
        // We require a user, else error
        if(!userId || 'string' === typeof userId) {
            let unknownUserError = new TypeError(`Expected 'userId' to be type 'string', received typeof userId`, `user.js`, 10);
            return reject(unknownUserError);
        }

        let endpoint = `${weeblyApiBaseUrl}/user/${userId}`;
        let requestOptions = {
            method: `GET`,
            url: endpoint,
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
                console.log('GET User response body: ', body);
                resolve(body);
            }
        });
    });
};
