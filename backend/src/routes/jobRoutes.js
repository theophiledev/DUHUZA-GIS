const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ctrl = require('../controllers/jobsController');

const router = express.Router();
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

// Public job board (FR27)
router.get('/', searchLimiter, ctrl.searchJobs);
router.get('/:id', ctrl.getPublicJob);

router.use(authenticate);

// Employer (any client) posts jobs (FR26)
router.post('/', requireRole(['CLIENT']), ctrl.createJob);
router.get('/mine/all', requireRole(['CLIENT']), ctrl.myJobs);

// Applicants (FR28)
router.post('/:id/apply', requireRole(['CLIENT']), ctrl.applyToJob);
router.get('/applications/mine', requireRole(['CLIENT']), ctrl.myApplications);

module.exports = router;
