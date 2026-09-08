const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET is not configured');
  }

  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

class AuthService {
  static async registerUser(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const user = await User.create({ ...userData, role: 'Warehouse Staff' });
    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
  }

  static async loginUser(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Contact administrator');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
  }

  static async getUserProfile(userId) {
    const user = await User.findById(userId).populate('assignedWarehouse', 'name location');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

module.exports = AuthService;
