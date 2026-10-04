const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getSuperAdminDashboard,
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All dashboard routes require authentication
router.use(authMiddleware);

// Admin dashboard accessible by Admin and Super-Admin
router.get('/admin', authorizeRoles('admin', 'super-admin'), getAdminDashboard);

// Super-Admin dashboard accessible only by Super-Admin
router.get('/super-admin', authorizeRoles('super-admin'), getSuperAdminDashboard);

module.exports = router;
