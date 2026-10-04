const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  getTasksQueryValidator,
} = require('../validators/taskValidator');

// All task routes require authentication (Own tasks only)
router.use(protect);

router
  .route('/')
  .post(createTaskValidator, validate, createTask)
  .get(getTasksQueryValidator, validate, getTasks);

router
  .route('/:id')
  .get(taskIdValidator, validate, getTaskById)
  .put(updateTaskValidator, validate, updateTask)
  .delete(taskIdValidator, validate, deleteTask);

module.exports = router;
