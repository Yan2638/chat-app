// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generateAIResponse } = require('../controllers/aiController');

// Просто POST на корень — потому что /api/ai уже в app.js
router.post('/', generateAIResponse);

module.exports = router;
