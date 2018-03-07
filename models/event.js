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

module.exports = mongoose.model('Event', EventSchema);
