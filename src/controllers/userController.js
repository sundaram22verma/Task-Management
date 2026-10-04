const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all users (with search, role filter, pagination)
 * @route   GET /api/users
 * @access  Private (Admin, Super-Admin)
 */
const getUsers = asyncHandler(async (req, res) => {
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
 * @route   GET /api/users/:id
 * @access  Private (Admin, Super-Admin)
 */
const getUserById = asyncHandler(async (req, res) => {
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
 * @desc    Create a user (by Admin or Super-Admin)
 * @route   POST /api/users
 * @access  Private (Admin, Super-Admin)
 * @note    Admin cannot create a Super-Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  // Rule: Admin cannot create Super-Admins
  if (req.user.role === 'admin' && role === 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins cannot create Super-Admin accounts',
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
 * @desc    Update user details (name, email)
 * @route   PUT /api/users/:id
 * @access  Private (Admin, Super-Admin)
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Prevent admin from editing a super-admin
  if (req.user.role === 'admin' && user.role === 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins cannot modify Super-Admin accounts',
    });
  }

  const { name, email } = req.body;

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another account',
      });
    }
    user.email = email;
  }

  if (name) {
    user.name = name;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @desc    Change user role
 * @route   PATCH /api/users/:id/role
 * @access  Private (Super-Admin only)
 */
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Prevent demoting self if current user is the super-admin
  if (req.user._id.toString() === user._id.toString() && role !== 'super-admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot demote your own Super-Admin account',
    });
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User role successfully changed to ${role}`,
    data: {
      user,
    },
  });
});

/**
 * @desc    Activate or Deactivate user account
 * @route   PATCH /api/users/:id/status
 * @access  Private (Admin, Super-Admin)
 */
const changeUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Cannot deactivate self
  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account',
    });
  }

  // Admin cannot deactivate Super-Admin
  if (req.user.role === 'admin' && user.role === 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admins cannot change Super-Admin status',
    });
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User account successfully ${isActive ? 'activated' : 'deactivated'}`,
    data: {
      user,
    },
  });
});

/**
 * @desc    Delete user and their associated tasks
 * @route   DELETE /api/users/:id
 * @access  Private (Super-Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Prevent deleting self
  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own Super-Admin account',
    });
  }

  // Cascade delete associated tasks
  await Task.deleteMany({ userId: user._id });
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User and associated tasks deleted successfully',
    data: null,
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserRole,
  changeUserStatus,
  deleteUser,
};
