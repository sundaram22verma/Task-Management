const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token containing user id and role
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role (super-admin, admin, user)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_secret_task_management_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
