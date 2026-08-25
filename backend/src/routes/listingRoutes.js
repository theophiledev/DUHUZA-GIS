const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ctrl = require('../controllers/listingController');

const router = express.Router();

const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

// --- Public (no auth) ---
router.get('/', searchLimiter, ctrl.searchListings); // FR15-FR19, ?lang=EN|RW|SW
router.get('/:id', ctrl.getPublicListing);
router.get('/:id/whatsapp-link', ctrl.getWhatsappLink); // FR20-FR22

// --- Agent only, scoped to own listings (FR4a, BR10) ---
router.use(authenticate);

router.post('/', requireRole(['AGENT']), ctrl.createListing);
router.get('/mine/all', requireRole(['AGENT']), ctrl.myListings);
router.put('/:id', requireRole(['AGENT']), ctrl.updateOwnListing);
router.post('/:id/submit', requireRole(['AGENT']), ctrl.submitListing);

module.exports = router;
