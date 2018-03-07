let mongoose = require('mongoose');

let schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

let OAuthSchema = new mongoose.Schema({
    site_id: String,
    user_id: String,
    version: String,
    active: Boolean,
    token: String,
    weebly_timestamp: String,
}, schemaOptions);

module.exports = mongoose.model('OAuth', OAuthSchema);
