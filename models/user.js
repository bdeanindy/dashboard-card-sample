let mongoose = require('mongoose');

let schemaOptions = {
    timestamp: true,
    toJSON: {
        virtuals: true
    }
};

let UserSchema = new mongoose.Schema({
    user_id: String,
    email: String,
    name: String,
    language: String
}, schemaOptions);

module.exports = mongoose.model('User', UserSchema);
