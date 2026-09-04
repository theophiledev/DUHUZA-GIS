const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rate-limit auth endpoints against brute force / scraping (NFR: Security)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const passwordResetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15 });

// Public auth routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/verify-reset-code', passwordResetLimiter, verifyResetCode);

// Authenticated profile & security routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

module.exports = router;
