"use strict";

const crypto = require('crypto');
const request = require('request');
const Utility = require('./utility');

/**
 * Weebly Card API Interface.
 */

const Card = {};

// Vars
const weeblyAPI  = process.env.MY_API_BASE_URI;
const clientId   = process.env.MY_CLIENT_ID;
const secretKey  = process.env.MY_CLIENT_SECRET;

// TODO: Rewrite this using spread operator and ES6
Card.populateCard = function (params, cb) {
    let token = params.token;
    let userId = params.userId;
    let siteId = params.siteId;
    let cardId = params.cardId;
    let userEmail = params.userEmail;
    let testModeState = params.testModeState;
    let loginLink = params.loginLink;
    let sites = params.sites;

    let cardData = [
        {
            "type": "text",
            "title": userEmail,
            "value": "User ID: " + userId
        },
    ];

    let siteList = {
        "type": "group",
        "label": "Sites",
        "components": []
    };

    for(let i = 0; i < sites.length; i++) {
        let siteObj = {
            type: "link",
            label: sites[i].title,
            description: sites[i].domain,
            link: sites[i].link
        };
        if(sites[i].publish_state) siteObj.value = "Published"
        siteList.components.push(siteObj);
    }

    cardData.push(siteList);

    let hash = Utility.generateHmac('PATCH' + '\n' + 'user/' + siteId + '\n' + JSON.stringify(cardData), secretKey)
    let payload = {
        card_id: cardId,
        data: cardData,
        site_id: siteId,
        user_id: user
    };
    let reqOpts = {
        method: 'PATCH',
        url: this.weeblyAPI + 'user/sites/' + siteId + '/cards/' + cardId,
        headers: {
            'X-Weebly-Access-Token': token,
            'Content-Type': 'application/json',
            'Accepts': 'application/json'
        },
    };

    // Execute the request to update the card
    request(reqOpts, function(err, response, body) {
        if(err) {
            console.error(err);
            cb(err, data);
        } else {
            console.log('populateCard response body: ', body);
            cb(null, body);
        }
    });

};

/**
 * @type Express.Router
 */
module.exports = Card;
