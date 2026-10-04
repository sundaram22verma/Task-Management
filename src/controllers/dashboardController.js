const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get Admin Dashboard metrics
 * @route   GET /api/dashboard/admin
 * @access  Private (Admin, Super-Admin)
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalTasks, pendingTasks, inProgressTasks, completedTasks, totalUsers] =
    await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'Pending' }),
      Task.countDocuments({ status: 'In Progress' }),
      Task.countDocuments({ status: 'Completed' }),
      User.countDocuments({ role: 'user' }),
    ]);

  res.status(200).json({
    success: true,
    message: 'Admin dashboard statistics retrieved successfully',
    data: {
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
      },
      users: {
        totalRegularUsers: totalUsers,
      },
    },
  });
});

/**
 * @desc    Get Super-Admin Dashboard metrics (system-wide breakdown)
 * @route   GET /api/dashboard/super-admin
 * @access  Private (Super-Admin only)
 */
const getSuperAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    superAdmins,
    admins,
    users,
    totalTasks,
    highPriorityTasks,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ role: 'super-admin' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'user' }),
    Task.countDocuments(),
    Task.countDocuments({ priority: 'High' }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Super-Admin system statistics retrieved successfully',
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        breakdownByRole: {
          superAdmins,
          admins,
          users,
        },
      },
      tasks: {
        total: totalTasks,
        highPriority: highPriorityTasks,
      },
    },
  });
});

module.exports = {
  getAdminDashboard,
  getSuperAdminDashboard,
};
