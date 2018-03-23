let mongoose = require('mongoose');

let schemaOptions = {
    timestamp: true,
    toJSON: {
        virtuals: true
    }
};

let CardSchema = new mongoose.Schema({
    user_id: String,
    site_id: String,
    app_id: String,
    token: String,
    card_id: String,
    name: String,
    hidden: Boolean,
    version: String,
    language: String,
    count: Number,
    card_data: [{}]
}, schemaOptions);

let Card = module.exports = mongoose.model('Card', CardSchema);

/*
Card.init().then((Card) => {
    console.log('Card.init()');
});
*/
