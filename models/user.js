let mongoose = require('mongoose');

let schemaOptions = {
    timestamp: true,
    toJSON: {
        virtuals: true
    }
};

let UserSchema = new mongoose.Schema({
    weebly_user_id: String,
    email: String,
    prefix: String,
    firstName: String,
    lastName: String,
    suffix: String,
    phone: String,
    streetAddress: String,
    streetAddressOne: String,
    cityTownVillage: String,
    stateProvince: String,
    country: String,
    language: String
}, schemaOptions);

module.exports = mongoose.model('User', UserSchema);
