const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const {
  registerValidator,
  loginValidator,
} = require('../validators/authValidator');

// Public endpoints
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Protected endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
