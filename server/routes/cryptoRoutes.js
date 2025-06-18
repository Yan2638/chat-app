const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

router.get('/crypto/:symbol', cryptoController.fetchPrice);

module.exports = router;
