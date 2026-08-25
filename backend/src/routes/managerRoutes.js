const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const ctrl = require('../controllers/managerController');

const router = express.Router();

router.use(authenticate, requireRole(['MANAGER', 'ADMIN']));

router.get('/listings/pending', requirePermission('can_approve_property'), ctrl.pendingQueue);
router.post('/listings/:id/approve', requirePermission('can_approve_property'), ctrl.approveListing);
router.post('/listings/:id/reject', requirePermission('can_approve_property'), ctrl.rejectListing);
router.put('/listings/:id/status', requirePermission('can_approve_property'), ctrl.changeListingStatus);
router.post('/listings/:id/reassign', requirePermission('can_approve_property'), ctrl.reassignListing);
router.put('/listings/:id', requirePermission('can_approve_property'), ctrl.managerEditListing);

// Market / Isoko (BR12 — same approval gate concept, own permission key
// so Admin can grant this independently of property approval — FR3a)
router.get('/market/pending', requirePermission('can_approve_market'), ctrl.pendingMarketQueue);
router.post('/market/:id/approve', requirePermission('can_approve_market'), ctrl.approveMarketItem);
router.post('/market/:id/reject', requirePermission('can_approve_market'), ctrl.rejectMarketItem);

// Services
router.get('/services/pending', requirePermission('can_approve_services'), ctrl.pendingServicesQueue);
router.post('/services/:id/approve', requirePermission('can_approve_services'), ctrl.approveServiceProvider);
router.post('/services/:id/reject', requirePermission('can_approve_services'), ctrl.rejectServiceProvider);

// GIS (FR24-FR25)
router.get('/gis/pending', requirePermission('can_approve_gis'), ctrl.pendingGisQueue);
router.post('/gis/:id/assign', requirePermission('can_approve_gis'), ctrl.assignGisRequest);

// Jobs (FR26)
router.get('/jobs/pending', requirePermission('can_approve_jobs'), ctrl.pendingJobsQueue);
router.post('/jobs/:id/approve', requirePermission('can_approve_jobs'), ctrl.approveJob);
router.post('/jobs/:id/reject', requirePermission('can_approve_jobs'), ctrl.rejectJob);

module.exports = router;
