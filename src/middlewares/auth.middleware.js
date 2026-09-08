const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication token required'));
    }

    if (!process.env.JWT_SECRET) {
      return next(new ApiError(500, 'JWT_SECRET is not configured'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User no longer exists'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'User account is deactivated'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid authentication token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication token expired'));
    }
    return next(error);
  }
};

module.exports = { authenticate };
