
const express = require('express');
const router = express.Router();
const { login, register, logout, authCheck } = require('../controllers/authController');

console.log({ login, register, logout, authCheck });
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/auth-check', authCheck);

module.exports = router;
