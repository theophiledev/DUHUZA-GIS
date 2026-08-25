const express = require('express');
const authRoutes = require('./authRoutes');
const listingRoutes = require('./listingRoutes');
const managerRoutes = require('./managerRoutes');
const adminRoutes = require('./adminRoutes');
const marketRoutes = require('./marketRoutes');
const servicesRoutes = require('./servicesRoutes');
const paymentsRoutes = require('./paymentsRoutes');
const gisRoutes = require('./gisRoutes');
const jobRoutes = require('./jobRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/manager', managerRoutes);
router.use('/admin', adminRoutes);
router.use('/market', marketRoutes);       // Phase 2 — Isoko (FR34-FR37)
router.use('/services', servicesRoutes);   // Phase 2 (FR38-FR41)
router.use('/payments', paymentsRoutes);   // Phase 3 — MTN MoMo (FR42-FR46)
router.use('/gis', gisRoutes);             // Phase 2 — GIS (FR23-FR25)
router.use('/jobs', jobRoutes);            // Phase 3 — Jobs (FR26-FR28)

module.exports = router;
