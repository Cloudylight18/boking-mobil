const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getDashboardStats);
router.post('/visit', dashboardController.recordVisitor);

module.exports = router;