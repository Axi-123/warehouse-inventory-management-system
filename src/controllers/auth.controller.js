const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.loginUser(email, password);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.getUserProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully'));
});

module.exports = {
  register,
  login,
  getProfile,
};
