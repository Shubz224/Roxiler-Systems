// Role-based access control middleware
// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'STORE_OWNER')
// Must be used AFTER verifyToken (needs req.user to exist)

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access forbidden' });
    }

    next();
  };
};

module.exports = { requireRole };
