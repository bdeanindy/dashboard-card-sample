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
    if(!params.user_id || !params.site_id) {
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
