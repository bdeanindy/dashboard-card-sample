let mongoose = require('mongoose');

let schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

let OAuthSchema = new mongoose.Schema({
    site_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    version: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false,
        required: true
    },
    token: String,
    weebly_timestamp: String,
}, schemaOptions);

module.exports = mongoose.model('OAuth', OAuthSchema);
