const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// ✅ Routes
router.get('/dashboard-stats', analyticsController.getDashboardStats);
router.get('/sales-by-date', analyticsController.getSalesByDate);

module.exports = router;
