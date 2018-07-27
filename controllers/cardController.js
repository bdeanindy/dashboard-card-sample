"use strict";

const Card = require('../models/card');
const OAuth = require('../models/oauth');
const WeeblyCardAPI = require('../weebly/card');

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


// TODO Testing this out, remove or fix if necessary
const getAuth = async (params) => {
    try {
        let auth = await OAuth.findOne({user_id: params.user_id, site_id: params.site_id});
        if(!auth) {
            let invalidParamsError = new Error('Invalid user_id or site_id');
            console.error(invalidParamsError);
            return invalidParamsError;
        }
        console.log('AUTH INFO FOUND FOR SITE AND USER INSTALLATION: ', auth);
        return auth;
    } catch(e) {
        console.error(e);
        throw e;
    }
};

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
    console.log('PARAMS: ', params);
    // Sanity check
    if(!params.user_id || !params.site_id || !params.name) {
        let err = new Error('Missing one or more required Card parameters');
        console.error(err);
        return err;
    }

    // For all use cases:
    //  - Must have access to the DB
    //  - App must have been successfully installed, and a valid installation object existing in the DB.oauth collection
    let auth;
    let dbCard;

    try {
        let auth = await OAuth.findOne({user_id: params.user_id, site_id: params.site_id})
        let dbCard = await Card.findOne(params);

        console.log('Auth: ', auth);
        console.log('DB Card: ', dbCard);

        if(!dbCard) {
            console.log('No Card exists in the DB for this site and user, retrieving data from Weebly API');
            let apiCard = await WeeblyCardAPI.getCardByName({site_id: params.site_id, name: params.name, token: auth.token});
            console.log('API Card: ', apiCard);
            apiCard = JSON.parse(apiCard); apiCard.user_id = params.user_id;
            apiCard.site_id = params.site_id;
            apiCard.app_id = auth.app_id;
            console.log('DATA BEING SEND TO CREATE NEW API CARD: ', apiCard);
            dbCard = await Card.create(apiCard);
        }

        console.log('Found a Card in the DB that matched, returning it for rendering in the management UI...');

        return dbCard;

        /*
        .then((authFromDB) => {
            auth = authFromDB;
            console.log('AUTH INFO FOUND FOR SITE AND USER INSTALLATION: ', auth);
            if(!authFromDB) {
                let invalidParamsError = new Error('Invalid user_id or site_id');
                console.error(invalidParamsError);
                return invalidParamsError;
            }
        });
        */
    } catch(e) {
        console.error(e);
        throw e;
    }

    // Handle 1st use case - When a user has successfully installed the app
    // Handle 2nd use case - When a user clicks the button in the Welcome component for this dashboard card 
    // Condition(s): 
    //  - We do NOT have an associated card in the DB for this site/user
    //  - User has installed the app, but has NOT configured this dashboard card to display a "Count" stat component.
    // Display: Successful installation  message, button to configure the app (create a new Stat Component for the card), and a button to skip this and return to the editor.
    /*
    try {
        console.log('GETTING CARD FROM DB IF EXISTS...');
        dbCard = await Card.findOne(params);
        console.log('dbCard: ', dbCard);
        if(!dbCard) {
            // To improve lookups for the card_id later to update via the API, pull from the API and store in the DB, but do not configure
            let cardFromApi = await WeeblyCardAPI.getCardByName({site_id: params.site_id, name: params.name, token: auth.token});
            let newDBCard = await Card.create(cardFromApi);
            console.log('NEW CARD CREATED IN DB: ', newDBCard);
            return newDBCard;
        } else {
            // TODO Need to make sure this has all the information we want to convey to the user
            return dbCard;
        }
    } catch(e) {
        console.error(e);
        throw e;
    }
    */

    // Handle 3rd use case - When a user clicks the "header" for this dashboard card
    // Condition(s):
    //  A - User has NOT configured the dashboard card
    //  B - User HAS configured the dashboard card
    // Display:
    //  A - Show same content as in 1st and 2nd use case, addressed above
    //  B - Show: Card's current count, when the app was installed (from DB.oauth), when the count was last updated (tracked in DB for the card by using the Mongoose.Schema timestamps option)
    /*
    try {
        console.log('GETTING CARD FROM DB IF EXISTS...');
        let dbCard = await Card.findOne(params);
        // We should ALWAYS be able to find auth using these params or there is a serious problem
        console.log('GETTING OAUTH IF IT EXISTS...');
        // Get the respective auth token (we store them all in MongoDB upon installation)
        let auth = await OAuth.findOne({user_id: params.user_id, site_id: params.site_id});

        // If we do not have a card in the DB, let's create one in the DB from the Weebly API Card for this site and user, and finally update the API Card to have the proper count stat
        if(!dbCard) {
            console.log('GET CARD FROM WEEBLY API...');
            let apiCard = await WeeblyCardAPI.getCardByName({site_id: auth.site_id, name: params.name, token: auth.token});
            console.log('WEEBLY API Card API Response: ', apiCard);
            let lang = (apiCard.language) ? apiCard.language : 'en';
            console.log('CREATING NEW CARD IN DB...');
            // TODO - May need to fix this logic, we might not want to return here before we update the card data in the API too???
            // TODO - METHOD IS OBSOLETE
            let countStatComponent = createNewCountStatComponent();
            // TODO - Is this the best way to handle this???
            if(apiCard.card_id) {
                let updatedCardWithCountStat = await WeeblyCardAPI.update({site_id: auth.site_id, card_id: apiCard.card_id, token: auth.token, data: countStatComponent});
            }
            let newDBCard = await Card.create({
                user_id: params.user_id,
                site_id: params.site_id,
                token: apiCard.token,
                card_id: apiCard.card_id,
                name: apiCard.name,
                hidden: apiCard.hidden,
                version: apiCard.version,
                language: lang,
                count: 1,
                active: 1,
                card_data: updatedCardWithCountStat.data
            });
            console.log('NEW CARD CREATED IN DB: ', newDBCard);
            return newDBCard;
        } else {
            try {
                // Bump the count in the card on the Weebly API
                // If successful, bump
                // Docs: http://mongoosejs.com/docs/api.html#findoneandupdate_findOneAndUpdate
                dbCard.data.forEach((component, index, array) => {
                    console.log('%s is of data type: %s: ', component, typeof component);
                    if('stat' === component.type && 'Count' === component.primary_label) {
                        array[index].primary_value += 1;
                    }
                });
                let updateQuery = Card.findOneAndUpdate(dbCard, {count: newCount, data: dbCard.data});
                // TODO - Could I use Node's Util.promisify() on the Mongoose.Query.exec so I could remove this callback?
                updateQuery.exec((err, updateCardResponse) => {
                    if(err) {
                        console.error(err);
                        return err;
                    }
                    console.log('CARD UPDATED IN WEEBLY API: ', updatedCardResponse);

                    // TODO Update card data in Weebly Card API
                    WeeblyCardAPI.update({
                        site_id: params.site_id,
                        card_id: updatedCardResponse.card_id,
                        card_data: updatedCardData
                    })
                    .then((response) => {
                        console.log('UPDATED CARD RESPONSE FROM WEEBLY API: ', response);
                        return response;
                    })
                    .catch((e) => {
                        console.error(e);
                        throw e;
                    });
                });
            } catch(e) {
                console.error(e);
                throw e;
            }
            return dbCard;
        }
    } catch(e) {
        console.error(e);
        throw e;
    }
    */
};

// Retrieve specified card details
exports.getCard = async (params) => {
    /*
    if(!params.id) {
        let myErr = new Error('Missing required `id` argument');
        console.error(myErr);
        return myErr;
    }
    try {
        let dbCard = await Card.getCardById(params.id);
        if(!dbCard) {
            console.log('NO CARD FOUND IN DB THAT MATCHES PROVIDED ID');
            console.log('PARAMS PROVIDED: ', params.id);
            // Get the valid access_token for this user and site
            OAuth.findOne({user_id: params.user_id, site_id: params.site_id})
            .then((auth) => {
                console.log('Using auth: ', auth);
                params.token = auth.token;
                // GET Card from Weebly API
                let cardFromApi = WeeblyCardAPI.getCardById({site_id: auth.site_id, card_id: params.id, token: auth.token})
            })
            .then((apiCard) => {
                console.log('Card from API: ', apiCard);
                return apiCard;
            })
            .then((card) => {
                // TODO Create new card in DB
                console.log('TODO: Create new card in the DB from the API Card');
                console.log('Card from API: ', card);
                return card;
            })
            .catch((e) => {
                console.error(e);
                throw e;
            });
        } else {
            // TODO Perform any backend operations
            // TODO Return updated requested card
        }
        //return Card.findById(id).exec();
    } catch(e) {
        console.error(e);
        throw e;
    }
    */
};

exports.configure = async (params = {}) => {
    if(!params.data || !params.name || !params.user_id && !params.site_id) {
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
        let preconfiguredCard = Card.find(query);

        OAuth.findOne({user_id: params.user_id, site_id: params.site_id})
        .then((auth) => {
            console.log('Using auth: ', auth);
            // Configure the card in the API first
            WeeblyCardAPI.updateCard({token: auth.token, card_id: preconfiguredCard.card_id, data: params.data})
            .then((configuredApiCard) => {
                return configuredApiCard;
            })
            .catch((e) => {
                console.error(e);
                throw e;
            });
        })
        .then((cardFromApiResponse) => {
            // Should include the following properties: card_id, name, hidden, card_data (or data docs are inconsistent)
            Card.findAndModify(query, {data: cardFromApiResponse.data})
            .then((configuredDBCard) => {
                console.log('ConfiguredDBCard: ', configuredDBCard);
                return configuredDBCard;
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

// Update a specific card
exports.handleUpdateEvent = async (params = {}) => {
    if(!params.data || !params.name || !params.user_id && !params.site_id) {
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
