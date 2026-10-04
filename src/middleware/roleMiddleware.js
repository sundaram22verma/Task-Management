/**
 * Role-Based Access Control (RBAC) middleware.
 * Checks whether the authenticated user has one of the allowed roles.
 *
 * @param  {...string} allowedRoles - List of permitted roles (e.g., 'super-admin', 'admin', 'user')
 * @returns {Function} Express middleware
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
