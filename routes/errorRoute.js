const express = require('express');
const router = new express.Router();
const errorController = require('../controllers/errorController');
const utilities = require("../utilities/index")

router.get('/generate-error', utilities.handleErrors(errorController.generateError));

module.exports = router;
