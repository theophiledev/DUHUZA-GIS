const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ctrl = require('../controllers/adminController');

const router = express.Router();

// Only Admin — no one can self-elevate (BR11)
router.use(authenticate, requireRole(['ADMIN']));

router.get('/users', ctrl.listUsers);
router.post('/users', ctrl.createUser); // FR1
router.put('/users/:id/permissions', ctrl.setUserPermission); // FR3a
router.put('/users/:id/status', ctrl.setUserStatus); // FR3b

module.exports = router;
