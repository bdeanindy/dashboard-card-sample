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
    // TODO: Improve this by using workers???
    if(!params.name && !params.user_id && !params.site_id) {
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

        let apiCard = await WeeblyCardAPI.getCardByName({site_id: params.site_id, name: params.name, token: installation.token});
        apiCard = JSON.parse(apiCard);

        // TODO: Hide before publishing or convert to use `logger.js`
        console.log('Installation: ', installation);
        console.log('Weebly API Card: ', apiCard);

        // Ensure API Card data has not already been configured (sanity check)
        let dataInApiCard = JSON.parse(apiCard.data);
        let cardDataType = dataInApiCard[0][0].type;
        if('welcome' !== cardDataType) {
            console.error(`Ummm...fix your client side code, should NOT expose the 'configure' route in already configured dashboard cards`);
            throw new Error(`Invalid request, cannot configure already configured dashboard cards`);
        }

        // Configured card text components
        let configuredTextComponent = {
            type: 'text',
            value: "This dashboard card is now configured with a `text` component!"
        };
        // Stub quote text component
        let quoteTextComponent = {
            type: 'text'
        };

        // Prepare Configured Card Component Data
        let cardData = [];
        // Retrieve random quote to populate second text component
        let quote = await QuoteAPI.getQuote();
        quote = JSON.parse(quote);
        // Format quote for Dashboard Card display
        quoteTextComponent.value = `<strong>&ldquo;</strong>${quote.quote}<strong>&rdquo;</strong><br /><em>&mdash; ${quote.author} &mdash; Category: ${quote.cat}</em><p>Quote data courtesty of: <a href="https://talaikis.com/random_quotes_api/" title="Random Quotes API">Random Quotes API</a></p>`;
        // Append two new text components to the updated Card Data: configured text component, Quote component. Later, on `dashboard.card.update` events, we will only ever update the Quote text component
        cardData.push(configuredTextComponent);
        cardData.push(quoteTextComponent);
        cardData = JSON.stringify(cardData);

        // First, update the Card in the Weebly API Card to use the new data
        let updatedApiCard = await WeeblyCardAPI.updateCard({site_id: params.site_id, token: installation.token, card_id: apiCard.card_id, data: cardData});
        console.log(`Updated API Card: ${updatedApiCard}`);

        // Upsert the card in MongoDB
        let updatedDBCard = await Card.findOneAndUpdate({card_id: apiCard.card_id}, {data: cardData, configured: true}, {new: true});
        console.log(`Updated DB Card: ${updatedDBCard}`);
        
        /**
        ONLY FOR DEBUGGING PURPOSES TO SEE IF WE ARE ACTUALLY UPDATING THE CARD DATA VIA THE API
            let apiCard2 = await WeeblyCardAPI.getCardByName({site_id: params.site_id, name: params.name, token: installation.token});
            apiCard2 = JSON.parse(apiCard2);
            console.log('Weebly API Card (2): ', apiCard2);
        END OF DEBUGGING
        **/

        return updatedDBCard;

    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Update a specific card
exports.handleUpdateEvent = async (params = {}) => {
    try {
        // Input check
        if(!params.name && !params.user_id && !params.site_id && !params.data) {
            console.log(`handleUpdateEvent params: ${params}`);
            let myErr = new Error('Missing one or more required parameters');
            console.error(myErr);
            return myErr;
        }

        // Sanity check
        if(req.app.client_id !== !params.data.platform_app_id) {
            let appIdMistmatchError = new Error('Missing one or more required parameters');
            console.error(appIdMismatchError);
            return appIdMismatchError;
        }

        // Prepare the Mongo Query
        let query = {
            user_id: params.data.user_id,
            site_id: params.data.site_id
        };

        let installation = await OAuth.findOne(query);

        // Prepare request data for Card API
        query.token = installation.token;
        // Configured card text components
        let configuredTextComponent = {
            type: 'text',
            value: "This dashboard card is now configured with a `text` component!"
        };
        // Stub quote text component
        let quoteTextComponent = {
            type: 'text'
        };
        // Prepare Configured Card Component Data
        let cardData = [];
        // Retrieve random quote to populate second text component
        let quote = await QuoteAPI.getQuote();
        quote = JSON.parse(quote);
        // Format quote for Dashboard Card display
        quoteTextComponent.value = `<strong>&ldquo;</strong>${quote.quote}<strong>&rdquo;</strong><br /><em>&mdash; ${quote.author} &mdash; Category: ${quote.cat}</em><p>Quote data courtesty of: <a href="https://talaikis.com/random_quotes_api/" title="Random Quotes API">Random Quotes API</a></p>`;
        // Append two new text components to the updated Card Data: configured text component, Quote component. Later, on `dashboard.card.update` events, we will only ever update the Quote text component
        cardData.push(configuredTextComponent);
        cardData.push(quoteTextComponent);
        cardData = JSON.stringify(cardData);

        // Update Weebly Card API data
        let cardFromApi = await WeeblyCardAPI.updateCard(query, {data: cardData});
        // Update Mongo DB data for this Card
        let dbCard = await Card.findOneAndUpdate({card_id: params.data.platform_dashboard_card_id}, {data: cardData}, {new: true});

        return dbCard;
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
        console.log('controller/cardController.js -> remove handler was called with these arguments: ', params);
        console.log('TODO: COMPLETE `remove` handler');
    } catch(e) {
        console.error(e);
        throw e;
    }
};
