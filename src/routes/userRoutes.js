const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserRole,
  changeUserStatus,
  deleteUser,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createUserValidator,
  updateUserValidator,
  updateRoleValidator,
  updateStatusValidator,
  userIdParamValidator,
} = require('../validators/userValidator');

// All user management routes require authentication
router.use(authMiddleware);

// Admin & Super-Admin routes
router
  .route('/')
  .get(authorizeRoles('admin', 'super-admin'), getUsers)
  .post(authorizeRoles('admin', 'super-admin'), createUserValidator, validate, createUser);

router
  .route('/:id')
  .get(authorizeRoles('admin', 'super-admin'), userIdParamValidator, validate, getUserById)
  .put(authorizeRoles('admin', 'super-admin'), updateUserValidator, validate, updateUser);

// Account status toggle: Admin & Super-Admin
router.patch(
  '/:id/status',
  authorizeRoles('admin', 'super-admin'),
  updateStatusValidator,
  validate,
  changeUserStatus
);

// Role change: Super-Admin only
router.patch(
  '/:id/role',
  authorizeRoles('super-admin'),
  updateRoleValidator,
  validate,
  changeUserRole
);

// User deletion: Super-Admin only
router.delete(
  '/:id',
  authorizeRoles('super-admin'),
  userIdParamValidator,
  validate,
  deleteUser
);

module.exports = router;
