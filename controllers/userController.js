"use strict";

const User = require('../models/user');
const OAuth = require('../models/oauth');
const WeeblyUserAPI = require('../weebly/user');

/*** WHEN DO YOU NEED TO INTERACT WITH THE USER API DATA?
You may wish to operate with data for the User when your app receives the `user.update` webhook event.

This event occurs when one of two (2) actions occur:
1. When the user logs into their Weebly account.
2. When ...???? (TODO: Need to test which actions cause this event to be broadcast to the subscription)

The data in these Webhook events will be:
{
    "client_id": "XXXXXXXXX",
    "client_version": "X.X.X",
    "event": "dashboard.card.update",
    "timestamp": 1531343861,
    "data": {
        "user_id": "XXXXXXXXX"
    },
    "hmac": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}

The `user_id` should be the value you use as a foreign key (and have indexed) in your data stores to improve lookups.
***/


/**
 * User data
 */

// Update a specific card
exports.handleUpdateEvent = async (params = {}) => {
    /*
    TODO: Need to figure out what we would do when we receive a user.update event...? Use cases?

    if(!params.name || !params.user_id && !params.site_id) {
        let myErr = new Error('Missing one or more required parameters');
        console.error(myErr);
        return myErr;
    }
    */

    try {
        // params.user_id and params.site_id are always required
        return await console.log(`Received a user.update webhook: ${params}`);
    } catch(e) {
        console.error(e);
        throw e;
    }
};

exports.add = async (params = {}) => {
    if(!params.user_id || !params.email || !params.firstName || !params.lastName || !params.country || !params.language) {
        // TODO: Error messaging
        // TODO: Throw Error
    }
    try {
        return await User.create(params);
    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Delete a specific card
exports.remove = async (params) => {
    if(!params || !params.card_id || !params.site_id) {
        let myErr = new Error('Missing one or more required parameters needed to delete a card');
        console.error(myErr);
        return myErr;
    }
    try {
        // TODO COMPLETE THIS METHOD
        return await User.findOneAndUpdate(params, {active: false});
    } catch(e) {
        console.error(e);
        throw e;
    }
};
