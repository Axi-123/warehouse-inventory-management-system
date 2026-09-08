const MovementService = require('../services/movement.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getAllMovements = asyncHandler(async (req, res) => {
  const data = await MovementService.getAllMovements(req.query, req.user);
  res.status(200).json(new ApiResponse(200, data, 'Movement history logs fetched successfully'));
});

const getMovementById = asyncHandler(async (req, res) => {
  const movement = await MovementService.getMovementById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, movement, 'Movement details fetched successfully'));
});

module.exports = {
  getAllMovements,
  getMovementById,
};
