const UserService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getAllUsers();
  res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User details fetched successfully'));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role, assignedWarehouse } = req.body;
  const user = await UserService.updateUserRole(req.params.id, role, assignedWarehouse);
  res.status(200).json(new ApiResponse(200, user, 'User role updated successfully'));
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await UserService.toggleUserStatus(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, user, `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`));
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
};
