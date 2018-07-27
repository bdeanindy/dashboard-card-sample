let mongoose = require('mongoose');
let manifest = require('../manifest');

let schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

// NOTE: The version.default is hardcoded for this tutorial, as we only ever expect a single dashboard card
let CardSchema = new mongoose.Schema({
    user_id: {
        type: String,
        index: true,
        required: true
    },
    site_id: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    app_id: {
        type: String,
        index: true,
        required: true
    },
    token: String,
    card_id: {
        type: String,
        index: true,
        required: true
    },
    name: {
        type: String,
        index: true,
        required: true
    },
    hidden: {
        type: Boolean,
        required: true,
        default: false
    },
    version: {
        type: String,
        default: manifest.dashboard_cards[0].version
    },
    language: {
        type: String,
        required: true,
        default: 'en-us'
    },
    count: {
        type: Number,
        default: 1,
        min: 1
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    card_data: [{}]
}, schemaOptions);

CardSchema.query.bySiteId = function(siteId) {
    return this.where({site_id: new RegExp(siteId, i) });
};

CardSchema.query.byCardId = function(cardId) {
    return this.where({card_id: new RegExp(cardId, i) });
};

CardSchema.query.byUserId = function(userId) {
    return this.where({user_id: new RegExp(userId, i) });
};

let Card = module.exports = mongoose.model('Card', CardSchema);

/*
Card.init().then((Card) => {
    console.log('Card.init()');
});
*/
