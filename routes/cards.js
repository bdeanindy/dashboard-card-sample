"use strict";

const JWT = require('jsonwebtoken');
const CardController = require('../controllers/cardController');
//const OAuth = require('../models/oauth');
const router = require('express').Router();

/**
 * Callback URL as specified in `manifest.json`
 */
router.get('/manage/:name/:jwt', (req, res, next) => {
	// Card name required to match up webhook events later
	if(!req.params.name) {
		let err = new Error('Invalid request, cardName path variable is required.');
		console.error(err);
		res.status(400).send(err);
	}

	// We must have a JWT in order to lookup the Dashboard Card's configurations for the user
	if(!req.params.jwt) {
		let err = new Error('Invalid request, JWT path variable is required.');
		console.error(err);
		res.status(400).send(err);
	}

	// The card name must be valid and known by the app
	if(!req.params.name || process.env.WEEBLY_DASHBOARD_CARD_NAME !== req.params.name) {
		let err = new Error('Invalid dashboard card path variable.');
		console.error(err);
		res.status(400).send(err);
	}

	// Verify JWT came from the source we expect
	let decoded = JWT.verify(req.params.jwt, req.app.secretKey, {algorithms: "HS256", maxAge: "1h"}); // If this breaks, might need to pass the secretKey parameter as Base64 buffer: `Buffer.from(req.app.secretKey, 'base64')`
	console.log('DECODED JWT: ', decoded);

	// Handle errors validating the JWT
	if(!decoded) {
		// POTENTIAL SECURITY VULNERABILITY: Must not proceed if you cannot verify the JWT 
		let err = new Error(`Unable to verify the JWT, cannot proceed`);
		console.error(err);
		res.status(403).send(err);
	}

	// Does a card exist in the DB already, if yes, use it
	CardController.manage({
		user_id: decoded.user_id,
		site_id: decoded.site_id,
		name: req.params.name
	})
	.then((card) => {
		console.log('card: ', card);
		if(!card) {
			// TODO: Could improve this methinks
			// Handle no card returned, or card not configured
			res.render('manageCard', decoded);
		} else {
			/**
				Card From DB
				{
					hidden: false,
					version: '1.0.0',
					language: 'en-us',
					count: 1,
					active: true,
					data: [],
					_id: 5b5b92beeb7d2e93f2a9894e,
					card_data: [],
					card_id: '900749780762366038',
					name: 'helloworld',
					user_id: '110864487',
					site_id: '369681026904144169',
					createdAt: 2018-07-27T21:46:38.038Z,
					updatedAt: 2018-07-27T21:46:38.038Z,
					__v: 0
				}
			**/
			// Handle a card being returned
			// Cleanse out data we do not wish to expose for security reasons
			let cleansedCard = {
				name: card.name,
				data: card.data,
				user_id: card.user_id,
				site_id: card.site_id,
				count: card.count,
				createdAt: card.createdAt,
				lastUpdated: card.updatedAt
			};
			// Use the token on the front-end to handle updating the Card API there...??? (if not, should remove it to prevent bad habits)
			res.render('manageCard', {card: cleansedCard});
		}
	})
	.catch((e) => {
		console.error(e);
		throw e;
	});
});

router.post('/configure/:name', function(req, res) {
	console.log('/configure/{{name}} route called');
	// Reject if we don't have the data we need
	if(!req.body) {
		let missingBodyErr = new Error('Invalid Request: Body must be supplied');
		res.status(400).send(missingBodyErr);
	} else {
		let reqData = req.body;
		if(!reqData.user_id|| !reqData.site_id || !req.params.name) {
			let err = new Error('Invalid Request: Must supply valid: user, site, card ID, and target amount to update the stat component.');
			console.error(err);
			res.status(400).send(err);
		} else {
			// Okay, now we are ready to configure this from the AJAX request on the client-side
			// TODO We are hard coding this for now, but in the future, we could have a list of components on the back-end or front-end which the user can create/configure dynamically
			let cardData = [
				{
					type: 'stat',
					primary_value: 1,
					primary_label: 'Number of times updated'
				}
			];
			CardController.configure({
				user_id: reqData.user_id,
				site_id: reqData.site_id,
				name: req.params.name,
				data: cardData
			});
		}
	}

	console.log('Client site provided request data: ', reqData);


	// Load from the DB, could be done in the controller
	/*
	let target = Card.findOne({
		site_id: decoded.site_id,
		user_id: decoded.user_id,
		name: req.params.name
	})
	.exec()
	.then((card) => {
		if(!card) {
			// We don't have a card in our DB (shouldn't be possible, but handle it as an error
			res.status(404).send('Card for user and site not found');
		} else {
		}
		let cardDataStatIndex = card.card_data.findIndex(function(element) {
			return 'stat' === element.type && 'Counter' === element.primary_label;
		});
		card.card_data[cardDataStatIndex].primaryValue += 1;

		// TODO: Really really really need to replace these callbacks with Promise or async/await
		apiCard.update({
			card_data: card.card_data
		}, function(err, updatedResponse) {
			if(err) {
				console.error(err);
				res.send(err);
			} else {
				console.log('Updated in the API:', updatedResponse);
				card.save();
				res.status(200).send({count: card.card_data[cardDataStatIndex].primaryValue});
			}
		});
	})
	.catch((err) => {
		console.error(err);
		throw err;
	});
	*/
});

/**
 * @type Express.Router
 */
module.exports = router;
