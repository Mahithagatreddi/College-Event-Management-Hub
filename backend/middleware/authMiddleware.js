const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect Routes - Validates JWT Session Token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'btech_department_event_hub_secure_key_2026_gemini');

      // Bind found user to request pipeline (excluding password hashes)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized: User session not found.' });
      }

      // Check if account was suspended (Only applicable for coordinators)
      if (req.user.role === 'coordinator' && req.user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Access Denied: Coordinator account suspended by Administrator.' });
      }

      next();
    } catch (error) {
      console.error(`JWT Authorization Failure: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Session expired or token invalid. Please log in again.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized: Access Token missing.' });
  }
};

// Check Roles Authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to role(s): [${roles.join(', ')}]. Current role: [${req.user ? req.user.role : 'none'}]`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
