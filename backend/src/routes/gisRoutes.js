const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ctrl = require('../controllers/gisController');

const router = express.Router();

router.use(authenticate);

// Client: request a parcel survey (FR23)
router.post('/', requireRole(['CLIENT']), ctrl.createGisRequest);
router.get('/mine/all', requireRole(['CLIENT']), ctrl.myGisRequests);

// Agent/surveyor: work assigned requests (FR25)
router.get('/assigned/all', requireRole(['AGENT']), ctrl.myAssignedRequests);
router.put('/:id/progress', requireRole(['AGENT']), ctrl.updateAssignedRequest);

// Owner, assignee, or staff can view a single request
router.get('/:id', ctrl.getGisRequest);

module.exports = router;
