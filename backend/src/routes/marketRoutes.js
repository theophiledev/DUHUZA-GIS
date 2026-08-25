const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/marketController');

const router = express.Router();
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

// --- Public ---
router.get('/', searchLimiter, ctrl.searchMarketItems); // FR36
router.get('/:id', ctrl.getPublicMarketItem);
router.get('/:id/whatsapp-link', ctrl.getMarketItemWhatsappLink); // FR37

// --- Any authenticated client (no Admin-provisioned account required, FR34) ---
router.use(authenticate);
router.post('/', ctrl.createMarketItem);
router.get('/mine/all', ctrl.myMarketItems);

module.exports = router;
