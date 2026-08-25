const express = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/servicesController');

const router = express.Router();

// --- Public ---
router.get('/', ctrl.searchProviders); // FR40
router.get('/:id', ctrl.getPublicProvider);
router.get('/:id/whatsapp-link', ctrl.getProviderWhatsappLink);

// --- Any authenticated client can register as provider (FR38) ---
router.use(authenticate);
router.post('/register', ctrl.registerAsProvider);
router.get('/mine/profile', ctrl.myProviderProfile);
router.put('/mine/profile', ctrl.updateOwnProviderProfile);

module.exports = router;
