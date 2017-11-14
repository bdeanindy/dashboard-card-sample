"use strict";

const crypto = require('crypto');
const request = require('request');
const Utility = require('./utility');

/**
 * Weebly Card
 */

const Card = module.exports = function(...options) {
    // TODO: Bind options to this
};

// Vars
const weeblyAPI  = process.env.MY_API_BASE_URI;
const clientId   = process.env.MY_CLIENT_ID;
const secretKey  = process.env.MY_CLIENT_SECRET;

Card.update = function (cardParams, cb) {
    // Outbound Weebly Card API Request Arguments
    const hMethod        = 'PATCH';
    const hAccept        = 'application/vnd.weebly.v1+json';
    const hContentType   = 'application/json';
    const hToken         = cardParams.token;

    // Passthrough from the event data used in route below
    let updateCardUrl   = `user/sites/${cardParams.site_id}/cards/${cardParams.platform_dashboard_card_id}`;
    let token           = cardParams.token;
    let userId          = cardParams.userId;
    let siteId          = cardParams.siteId;
    let cardId          = cardParams.cardId;

    // Card Data - An array of dashboard componentsa (Array includes property values for each component on the card)
    let updatedCardContent = [
        {
            "type": "text",
            "title": "Dashboard Text Content",
            "value": "Data for today..."
        },
        {
            "type": "group",
            "label": "Nom Nom Data",
            "components": [{
                "type": "stat",
                "label": "Clicks",
                "primary_value": "0",
                "primary_label": "Number of clicks on this component",
                "link": "https://bdean-dashboard-card.herokuapp.com/cards/:jwt"
            },
            {
                "type": "text",
                "title": "Some text content",
                "value": ""
            }]
        }
    ];

    let payload = {
        card_id: cardId,
        card_data: updatedCardContent,
        site_id: siteId,
        user_id: userId
    };

    let reqOpt= {
        method: reqMethod,
        url: this.weeblyAPI + updateCardUrl,
        headers: {
            'X-Weebly-Access-Token': hToken,
            'Content-Type': hContentType,
            'Accepts': hAccepts 
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
