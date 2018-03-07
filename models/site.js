let mongoose = require('mongoose');

let schemaOptions = {
    timestamp: true,
    toJSON: {
        virtuals: true
    }
};

let SiteSchema = new mongoose.Schema({
    user_id: String,
    site_id: String,
    site_title: String,
    domain: String,
    is_published: Boolean,
    plan_level: String,
    date_format: String,
    time_format: String,
    time_zone: String,
    language: String
}, schemaOptions);

module.exports = mongoose.model('Site', SiteSchema);
