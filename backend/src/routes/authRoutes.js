const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, requestPasswordReset } = require('../controllers/authController');

const router = express.Router();

// Rate-limit auth endpoints against brute force / scraping (NFR: Security)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/reset-password', authLimiter, requestPasswordReset);

module.exports = router;
