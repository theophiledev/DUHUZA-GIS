const express = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/paymentsController');

const router = express.Router();

// Webhook — MTN calls this directly, no user JWT attached. Auth happens
// inside momoCallback via verifyMomoSignature (BR14), not via this
// middleware stack.
router.post('/momo/callback', ctrl.momoCallback);

// User-initiated routes require login
router.use(authenticate);
router.post('/momo/request', ctrl.initiateMomoRequest); // FR44
router.get('/mine', ctrl.myTransactions);

module.exports = router;
