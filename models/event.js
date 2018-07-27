let mongoose = require('mongoose');

let schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

let EventSchema = new mongoose.Schema({
    client_id: String,
    client_version: String,
    eventType: String,
    weeblyTimestamp: String,
    hmac: String,
    data: [{}]
}, schemaOptions);

// TODO: Uncomment this out later when mapping to appropriate event handlers in the post.save middleware below
// Known events this app can handle
/*
const eventControllerMap = {
    'dashboard.card.update': dashboardCardEventHandler,
    'app.uninstall': appUninstallEventHandler
};
*/

EventSchema.post('save', function(doc) {
    // TODO: Map this out later to trigger the appropriate event handlers
    console.log(`Event saved: ${doc}`);
});

module.exports = mongoose.model('Event', EventSchema);
