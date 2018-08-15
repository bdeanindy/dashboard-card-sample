"use strict";

const OAuth = require('../models/oauth');
const Card = require('../models/card');
const WeeblyCardAPI = require('../weebly/card');

/**
 * App Installation Data
 */

// Retrieve list of installations (OAuths) for the user/site
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

// Retrieve an active installation (OAuths) for the user/site
exports.getActiveInstallation = async (params = {}) => {
    if(!params.user_id || !params.site_id) {
        let err = new Error('Missing required parameters');
        console.error(err);
        return err;
    }

    try {
        return await OAuth.find({user_id: params.user_id, site_id: params.site_id, active: true});
    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Handle New App Installation
exports.install = async (params = {}) => {
    if(!params.user_id || !params.site_id) {
        let err = new Error('Missing required parameters');
        console.error(err);
        return err;
    }

    try {
        let installation = await OAuth.create({
            site_id: params.site_id,
            user_id: params.user_id,
            active: false,
            version: params.version,
            weebly_timestamp: params.weebly_timestamp
        });
        return installation;
    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Activate an App Installation
exports.activate = async (params = {}) => {
    if(!params.user_id || !params.site_id || !params.access_token) {
        //console.log('activate params:', params);
        let err = new TypeError('Missing one or more required arguments', 'appController.js', 52);
        console.error(err);
        return err;
    }

    try {
        let query = {
            user_id: params.user_id,
            site_id: params.site_id
        };

        let updateData = {
            token: params.access_token,
            active: true
        };
        let activatedInstallation = await OAuth.findOneAndUpdate(query, updateData, {new: true});
        return activatedInstallation;
    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Delete a specific app
exports.uninstall = async (params = {}) => {
    // Make sure we have been provided all the necessary information to handle this properly
    if(!params.data.user_id || !params.data.site_id && process.env.WEEBLY_CLIENT_ID !== params.data.platform_app_id) {
        let uninstallErr = new Error('Invalid payload, cannnot proceed');
        console.error(uninstallErr);
        return uninstallErr;
    }

    try {
        let query = {
            site_id: params.site_id,
            user_id: params.user_id
        };
        let uninstalledApp = await OAuth.findOneAndUpdate(query, {active: false}, {new: true});
        let deactivateCard = await Card.findOneAndUpdate(query, {active: false}, {new: true});
        // TODO: Hide card from Weebly Home (shouldn't be necessary, but just in case)
        // let hiddenCard = await WeeblyCardAPI.hideCard(query);
        return uninstalledApp;
    } catch(e) {
        console.error(e);
        throw e;
    }
};
