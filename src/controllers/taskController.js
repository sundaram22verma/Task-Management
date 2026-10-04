const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new task owned by the authenticated user
 * @route   POST /api/tasks
 * @access  Private (Authenticated users - Own tasks only)
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      task,
    },
  });
});

/**
 * @desc    Get all tasks owned by the authenticated user with filtering, search, and pagination
 * @route   GET /api/tasks
 * @access  Private (Authenticated users - Own tasks only)
 */
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, page = 1, limit = 10 } = req.query;

  // Strict isolation: authenticated user can ONLY access their own tasks
  const query = { userId: req.user._id };

  // Filter by task status
  if (status) {
    query.status = status;
  }

  // Filter by task priority
  if (priority) {
    query.priority = priority;
  }

  // Search by title or description (case-insensitive)
  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  // Pagination parameters
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
    message: 'Tasks retrieved successfully',
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
 * @desc    Get single task by ID (Own task only)
 * @route   GET /api/tasks/:id
 * @access  Private (Authenticated users - Own task only)
 */
const getTaskById = asyncHandler(async (req, res) => {
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

  // Ownership Guard: User can only access their own task
  if (task.userId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only access your own tasks.',
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
 * @desc    Update task by ID (Own task only)
 * @route   PUT /api/tasks/:id
 * @access  Private (Authenticated users - Own task only)
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Ownership Guard: User can only update their own task
  if (task.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only update your own tasks.',
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
    message: 'Task updated successfully',
    data: {
      task: updatedTask,
    },
  });
});

/**
 * @desc    Delete task by ID (Own task only)
 * @route   DELETE /api/tasks/:id
 * @access  Private (Authenticated users - Own task only)
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Ownership Guard: User can only delete their own task
  if (task.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only delete your own tasks.',
    });
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: null,
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
