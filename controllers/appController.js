"use strict";

const OAuth = require('../models/oauth');

/**
 * App Installation Data
 */

// Retrieve list of cards for the user/site
exports.list = async (params = {}) => {
    if(!params.user_id || !params.site_id) {
        let err = new Error('Missing required parameters');
        console.error(err);
        return err;
    }

    try {
        return await OAuth.find({user_id: params.user_id, site_id: params.site_id});
    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Delete a specific app
exports.uninstall = async (params = {}) => {
    /** Actual Event for Reference
    {
        "client_id": "1448453350",
        "client_version": "2.0.0",
        "event": "app.uninstall",
        "timestamp": 1533000982,
        "data": {
            "user_id": "110864487",
            "site_id": "369681026904144169",
            "platform_app_id": "1448453350"
        },
        "hmac": "93b5794d63d3f451210f30d5f9443fc7b752a2d5e0d31e301860ed715d5f3a96"
    }
    **/
    if(!params.data.user_id || !params.data.site_id) {
        let myErr = new Error('Missing one or more required parameters needed to delete an app');
        console.error(myErr);
        return myErr;
    }
    try {
        // TODO COMPLETE THIS METHOD
        return await OAuth.findOneAndUpdate({site_id: params.site_id, user_id: params.user_id}, {active: false});
    } catch(e) {
        console.error(e);
        throw e;
    }
};
