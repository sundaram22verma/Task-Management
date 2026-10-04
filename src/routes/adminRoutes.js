const express = require('express');
const router = express.Router();

const {
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  toggleUserStatus,
  changeUserRole,
  deleteAdminUser,
  getAdminTasks,
  getAdminTaskById,
  updateAdminTask,
  deleteAdminTask,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');

const {
  createUserValidator,
  updateUserValidator,
  updateRoleValidator,
  updateStatusValidator,
  userIdParamValidator,
} = require('../validators/userValidator');

const {
  updateTaskValidator,
  taskIdValidator,
  getTasksQueryValidator,
} = require('../validators/taskValidator');

// Protect all admin routes with JWT authentication
router.use(protect);

// -------------------------------------------------------------
// USER MANAGEMENT ROUTES
// -------------------------------------------------------------

// List & Create Users (Admin & Super Admin)
router
  .route('/users')
  .get(authorize('admin', 'super-admin'), getAdminUsers)
  .post(
    authorize('admin', 'super-admin'),
    createUserValidator,
    validate,
    createAdminUser
  );

// Single User Details & Update (Admin & Super Admin - hierarchy protected)
router
  .route('/users/:id')
  .get(
    authorize('admin', 'super-admin'),
    userIdParamValidator,
    validate,
    getAdminUserById
  )
  .put(
    authorize('admin', 'super-admin'),
    updateUserValidator,
    validate,
    updateAdminUser
  );

// Toggle User Status: Active / Inactive (Admin & Super Admin - hierarchy & self-protection guarded)
router.patch(
  '/users/:id/status',
  authorize('admin', 'super-admin'),
  updateStatusValidator,
  validate,
  toggleUserStatus
);

// Change User Role (Super Admin ONLY - self-demote guarded)
router.patch(
  '/users/:id/role',
  authorize('super-admin'),
  updateRoleValidator,
  validate,
  changeUserRole
);

// Hard Delete User (Super Admin ONLY - cascade delete tasks & self-delete guarded)
router.delete(
  '/users/:id',
  authorize('super-admin'),
  userIdParamValidator,
  validate,
  deleteAdminUser
);

// -------------------------------------------------------------
// SYSTEM-WIDE TASK MANAGEMENT ROUTES
// -------------------------------------------------------------

// List all tasks system-wide with search, filtering, and pagination
router
  .route('/tasks')
  .get(
    authorize('admin', 'super-admin'),
    getTasksQueryValidator,
    validate,
    getAdminTasks
  );

// Retrieve, update, or delete any user's task
router
  .route('/tasks/:id')
  .get(
    authorize('admin', 'super-admin'),
    taskIdValidator,
    validate,
    getAdminTaskById
  )
  .put(
    authorize('admin', 'super-admin'),
    updateTaskValidator,
    validate,
    updateAdminTask
  )
  .delete(
    authorize('admin', 'super-admin'),
    taskIdValidator,
    validate,
    deleteAdminTask
  );

module.exports = router;
