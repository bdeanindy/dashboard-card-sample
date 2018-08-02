"use strict";

const Card = require('../models/card');
const OAuth = require('../models/oauth');
const WeeblyCardAPI = require('../weebly/card');
const QuoteAPI = require('../svcs/quote.js');

/*** WHEN DO YOU NEED TO UPDATE THE CARD API DATA?
You need to update the Card Data in the API EVERY TIME that your app receives the `dashboard_card.update` webhook event.
This event occurs when one of two (2) actions occur:
1. When the user goes to their dashboard page for this site.
2. When the user has CLOSED the dashboard card takeover.

The data in these Webhook events will be:
{
    "client_id": "XXXXXXXXX",
    "client_version": "X.X.X",
    "event": "dashboard.card.update",
    "timestamp": 1531343861,
    "data": {
        "user_id": "XXXXXXXXX",
        "site_id": "XXXXXXXXXXXXXXXXXX",
        "platform_app_id": "XXXXXXXX",
        "platform_dashboard_card_id": "XXXXXXXXXXXXXXXXXXXX",
        "platform_dashboard_card_version": "Y.Y.Y",
        "name": "XXXXXXXXXX",
        "language": "en"
    },
    "hmac": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}

This should be enough information (after a successful installation of your app) to lookup the pertinent information for the correct DB Card for the correct Weebly Site allowing you to perform the necessary lookups in your own data stores to perform the Card API.update request.
***/

/*** TYPES OF DASHBOARD CARD TAKEOVERS
There are two (2) types of dashboard card takeovers:
1. Dashboard Card Header Link Takeovers - displayed when a user clicks the header of a dashboard card, and defined in the manifest.dashboard_card.link property
2. Individual Dashboard Card Component Takeovers - displayed when a user clicks a component (https://dev.weebly.com/pf_apps_dashboard_create.html#add-components) within the dashboard card, these are defined as the `link` component for individual dashboard card components

The Dashboard Card Header Link Takeovers should display summary information for the app as a whole.
In contrast, the Individual Dashboard Card Component Takeovers should display information pertinent to that particular component
***/

/*** HOW MANAGE WORKS FOR THE TUTORIAL
This Dashboard Card's takeover screen is this manage flow, and it is loaded with the JWT data passed as the argument object to `exports.manage` below.
The `manage` route for the tutorial is called upon in one of three cases:
1. When the app is installed on a site successfully, user is redirected to the dashboard card's takeover screen (where normally they would configure the app)
    - Only display information about the app installation working here, and give them a link to publish the site 
2. When the user clicks the "button" in the Welcome component for this dashboard card, only visible if the user SKIPs the configuration of the app (which creates the Stat Component in place of the Welcome Component)
3. When the user clicks the "header" for this dashboard card in their site dashboard
***/


/**
 * Weebly Card data from Mongo via Mongoose
 */

// Retrieve list of cards for the user/site
exports.list = async (params = {}) => {
    if(!params.user_id || !params.site_id) {
        let err = new Error('Missing required parameters');
        console.error(err);
        return err;
    }

    try {
        let cards = await Card.find({user_id: params.user_id, site_id: params.site_id});
        return cards;
    } catch(e) {
        console.error(e);
        throw e;
    }
};

exports.manage = async (params = {}) => {
    // Sanity check
    if(!params.user_id || !params.site_id || !params.name) {
        let err = new Error('Missing one or more required Card parameters');
        console.error(err);
        return err;
    }

    // For all use cases:
    //  - Must have access to the DB
    //  - App must have been successfully installed, and a valid installation object existing in the DB.oauth collection
    try {
        let auth = await OAuth.findOne({user_id: params.user_id, site_id: params.site_id}); // Cannot proceed if we do not have a valid app installation
        let dbCard = await Card.findOne(params);

        console.log('Auth: ', auth);
        console.log('DB Card: ', dbCard);

        // Handle new card (should contain a `welcome` component only)
        if(!dbCard) {
            console.log('No ACTIVE Card exists in the DB for this site and user, retrieving data from Weebly API');
            let apiCard = await WeeblyCardAPI.getCardByName({site_id: params.site_id, name: params.name, token: auth.token});
            console.log('Data from Weebly Card API: ', apiCard);
            apiCard = JSON.parse(apiCard);
            apiCard.user_id = params.user_id;
            apiCard.site_id = params.site_id;
            apiCard.app_id = auth.app_id;
            console.log('Create new Card in MongoDB supplying this data: ', apiCard);
            dbCard = await Card.create(apiCard);
            console.log('New card has been created in the DB, returning it to be rendered in the welcome UI...');
        } else {
            console.log('Found a Card in the DB that matched, returning it for rendering in the management UI...');
        }

        return dbCard;

    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Configure card in MongoDB and Update Weebly Card API
exports.configure = async (params = {}) => {
    // TODO: Improve this in the future to address any security risks/concerns
    if(!params.name || (!params.user_id && !params.site_id)) {
        let paramErr = new Error('Missing one or more required parameters');
        console.error(paramErr);
        return paramErr;
    }

    // For all use cases:
    //  - Must have access to the DB
    //  - App must have been successfully installed, and a valid installation object existing in the DB.oauth collection
    try {
        // Ensure you know with whom you're operating, no app installation (do not proceed).
        let installation = await OAuth.findOne({user_id: params.user_id, site_id: params.site_id})
        if(!installation || !installation.active) throw new Error('Cannot proceed, no active app installation exists');

        let dbCard = await Card.findOne(params);
        let apiCard = await WeeblyCardAPI.getCardByName({site_id: params.site_id, name: params.name, token: installation.token});
        apiCard = JSON.parse(apiCard);

        // TODO: Hide before publishing or convert to use `logger.js`
        console.log('Installation: ', installation);
        console.log('DB Card: ', dbCard);
        console.log('Data from the API Card: ', apiCard);

        // Stub configured card components
        let configuredTextComponent = {
            type: 'text',
            value: "This dashboard card is now configured with a `text` component!"
        };
        let quoteTextComponent = {
            type: 'text'
        };


        // Prepare Configured Card Component Data
        let cardData = [];
        // Retrieve a random quote to populate the second text component
        let quote = await QuoteAPI.getQuote();
        // Format the random quote for Dashboard Card display and append to respective text component
        quoteTextComponent.value = `<strong>&ldquo;</strong>${quote.quote}<strong>&rdquo;</strong><br /><em>&mdash; ${quote.author} &mdash; Category: ${quote.cat}</em><p>Quote data courtesty of: <a href="https://talaikis.com/random_quotes_api/" title="Random Quotes API">Random Quotes API</a></p>`;
        console.log(`New Quote: ${quoteTextComponent.value}`);
        // Append two text components to the updated Card Data: configured text component, Quote component. Later, on `dashboard.card.update` events, we will only ever update the Quote text component
        cardData.push(configuredTextComponent);
        cardData.push(quoteTextComponent);

        // Make sure the API Card data has not been configured (sanity check)
        if('welcome' !== apiCard.data[0].type) {
            console.error(`Ummm...fix your client side code, should NOT expose the 'configure' route in already configured dashboard cards`);
            throw new Error(`Invalid request, cannot configure already configured dashboard cards`);
        }

        // Update the database (of course, if you too are using MongoDB and Mongoose, you could instead add this as methods to the model, to simplify your business logic in the controller)
        // Create card in MongoDB if it does not exist
        let updatedDBCard = (dbCard.card_id)
            ? await Card.findOneAndUpdate(dbCard, {data: cardData, configured: true}, {new: true})
            : await Card.create({
                user_id: params.user_id,
                site_id: params.site_id,
                name: params.name,
                token: req.app.token,
                card_id: apiCard.card_id,
                data: cardData,
                configured: true
            })
            ;
        console.log(`Update DB Card: ${updatedDBCard}`);

        // Update the Card in the Weebly API Card to use the new data now that we've saved it
        let updatedApiCard = await WeeblyCardAPI.updateCard({token: installation.token, card_id: apiCard.card_id, data: cardData})
        console.log(`Updated API Card: ${updatedApiCard}`);

        return updatedDBCard;

    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Update a specific card
exports.handleUpdateEvent = async (params = {}) => {
    // TODO: REFACTOR THIS
    if(!params.data || !params.name || !params.user_id && !params.site_id) {
        console.log(`handleUpdateEvent params: ${params}`);
        let myErr = new Error('Missing one or more required parameters');
        console.error(myErr);
        return myErr;
    }

    try {
        // params.user_id and params.site_id are always required
        let query = {
            user_id: params.user_id,
            site_id: params.site_id,
            name: params.name
        };

        // Get auth information for this event
        OAuth.findOne({user_id: params.user_id, site_id: params.site_id})
        .then((auth) => {
            console.log('Using auth: ', auth);
            // Expects an object with: site_id, token, data to complete the update operation via the Weebly API
            let cardFromApi = WeeblyCardAPI.updateCard({site_id: params.site_id, token: auth.token, data: params.data});
            return cardFromApi;
        })
        .then((cardFromApiResponse) => {
            // Should include the following properties: card_id, name, hidden, card_data (or data docs are inconsistent)
            let calculatedCount = cardFromApiResponse.data[0].primary_value;
            Card.findAndModify(query, {data: cardFromApiResponse.data, count: calculatedCount})
            .then((apicard) => {
                console.log('Card from API: ', apiCard);
                return apiCard;
            });
        })
        .catch((e) => {
            console.error(e);
            throw e;
        });
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
    } catch(e) {
        console.error(e);
        throw e;
    }
};
