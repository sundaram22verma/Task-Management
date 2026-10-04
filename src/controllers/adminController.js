const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all users with search, role/status filtering, and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin & Super Admin)
 */
const getAdminUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const totalPages = Math.ceil(total / limitNum) || 1;

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    },
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin & Super Admin)
 */
const getAdminUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Create a user account with role hierarchy validation
 * @route   POST /api/admin/users
 * @access  Private (Admin & Super Admin)
 * @rules   Admin can only create 'user' role. Only Super Admin can create 'admin' or 'super-admin'.
 */
const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  // Role Hierarchy Safeguard: Admin cannot create Admin or Super-Admin accounts
  if (req.user.role === 'admin' && role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins can only create regular user accounts. Only Super Admins can create administrative accounts.',
    });
  }

  // Super Admin cannot create another Super Admin via this route
  if (role === 'super-admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Insufficient privileges to create a Super Admin.',
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email address',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Update user details with role hierarchy validation
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin & Super Admin)
 * @rules   Admin CANNOT update or modify another admin or a super-admin.
 */
const updateAdminUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Role Hierarchy Safeguard: Admin cannot modify an Admin or Super-Admin account
  if (
    req.user.role === 'admin' &&
    (targetUser.role === 'admin' || targetUser.role === 'super-admin')
  ) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins cannot modify admin or super-admin accounts.',
    });
  }

  const { name, email } = req.body;

  if (email && email !== targetUser.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another account',
      });
    }
    targetUser.email = email;
  }

  if (name) {
    targetUser.name = name;
  }

  const updatedUser = await targetUser.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @desc    Toggle user active/inactive status with hierarchy & self-protection guards
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin & Super Admin)
 * @rules   Admins cannot deactivate admins/super-admins. Cannot deactivate self.
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Self-Protection Guard: Cannot deactivate own account
  if (req.user._id.toString() === targetUser._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: You cannot deactivate your own account.',
    });
  }

  // Role Hierarchy Safeguard: Admin cannot deactivate Admin or Super-Admin
  if (
    req.user.role === 'admin' &&
    (targetUser.role === 'admin' || targetUser.role === 'super-admin')
  ) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins cannot deactivate admin or super-admin accounts.',
    });
  }

  const { isActive } = req.body;
  targetUser.isActive = isActive !== undefined ? isActive : !targetUser.isActive;
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User account successfully ${targetUser.isActive ? 'activated' : 'deactivated'}`,
    data: {
      user: targetUser,
    },
  });
});

/**
 * @desc    Change user role with self-protection guard
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Super Admin ONLY)
 * @rules   Super Admin cannot demote their own account.
 */
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Self-Protection Guard: Super Admin cannot demote own role
  if (
    req.user._id.toString() === targetUser._id.toString() &&
    role !== 'super-admin'
  ) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Super Admins cannot demote their own role.',
    });
  }

  targetUser.role = role;
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User role successfully changed to '${role}'`,
    data: {
      user: targetUser,
    },
  });
});

/**
 * @desc    Hard delete user account with cascade task deletion & self-protection guard
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Super Admin ONLY)
 * @rules   Super Admin cannot delete own account.
 */
const deleteAdminUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Self-Protection Guard: Super Admin cannot delete own account
  if (req.user._id.toString() === targetUser._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Super Admins cannot delete their own account.',
    });
  }

  // Cascade delete all tasks owned by this user
  await Task.deleteMany({ userId: targetUser._id });
  await targetUser.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User and all associated tasks deleted successfully',
    data: null,
  });
});

/**
 * @desc    Get all tasks system-wide with search, filtering, and pagination
 * @route   GET /api/admin/tasks
 * @access  Private (Admin & Super Admin)
 */
const getAdminTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, userId, page = 1, limit = 10 } = req.query;

  const query = {};

  if (userId) {
    query.userId = userId;
  }

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const totalPages = Math.ceil(total / limitNum) || 1;

  res.status(200).json({
    success: true,
    message: 'All system tasks retrieved successfully',
    data: {
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    },
  });
});

/**
 * @desc    Get any single task by ID
 * @route   GET /api/admin/tasks/:id
 * @access  Private (Admin & Super Admin)
 */
const getAdminTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(
    'userId',
    'name email role'
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: {
      task,
    },
  });
});

/**
 * @desc    Update any user's task
 * @route   PUT /api/admin/tasks/:id
 * @access  Private (Admin & Super Admin)
 */
const updateAdminTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  const { title, description, status, priority, dueDate } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;

  const updatedTask = await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully by administrator',
    data: {
      task: updatedTask,
    },
  });
});

/**
 * @desc    Delete any user's task
 * @route   DELETE /api/admin/tasks/:id
 * @access  Private (Admin & Super Admin)
 */
const deleteAdminTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully by administrator',
    data: null,
  });
});

module.exports = {
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
};
