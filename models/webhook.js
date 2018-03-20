let mongoose = require('mongoose');

let schemaOptions = {
    timestamp: true,
    toJSON: {
        virtuals: true
    }
};

let WebhookSchema = new mongoose.Schema({
    app_id: String,
    callback_url: String,
    events: [{type: String},
    headers: String,
    user_id: String,
    site_id: String,
    webhook_id: String,
}, schemaOptions);

let Webhook = module.exports = mongoose.model('Webhook', WebhookSchema);

/*
Webhook.init().then((Webhook) => {
    console.log('Webhook.init()');
});
*/
