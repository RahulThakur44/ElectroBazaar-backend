// categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); // Controller import karo

// Category data fetch karne ka route
router.get('/', categoryController.getCategories);  // API call par controller ko call karo

module.exports = router;
