const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const ROLES = require('../constants/roles');

class UserService {
  static async getAllUsers() {
    return await User.find().select('-password').populate('assignedWarehouse', 'name location');
  }

  static async getUserById(id) {
    const user = await User.findById(id).select('-password').populate('assignedWarehouse', 'name location');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async updateUserRole(id, role, assignedWarehouse) {
    if (!Object.values(ROLES).includes(role)) {
      throw new ApiError(400, `Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`);
    }

    const updateData = { role };
    if (assignedWarehouse !== undefined) {
      updateData.assignedWarehouse = assignedWarehouse || null;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .populate('assignedWarehouse', 'name location');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  static async toggleUserStatus(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}

module.exports = UserService;
