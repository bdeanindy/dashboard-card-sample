"use strict";

const Card = require('../models/card');

/**
 * Weebly Card
 */

// Retrieve list of cards from DB
exports.list = () => {
    try {
        return Card.find({});
    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Retrieve the card details from DB
exports.details = (id) => {
    try {
        return Card.findById(id).exec();
    } catch(e) {
        console.error(e);
        throw e;
    }
};

// Update a card in the DB
exports.update = (data) => {
    try {
        return Card.findAndModify({});
    } catch(e) {
        console.error(e);
        throw e;
    }
};

exports.remove = (id) => {
    try {
        return Card.findByIdAndRemove({});
    } catch(e) {
        console.error(e);
        throw e;
    }
};
