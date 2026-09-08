const ItemService = require('../services/item.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createItem = asyncHandler(async (req, res) => {
  const item = await ItemService.createItem(req.body);
  res.status(201).json(new ApiResponse(201, item, 'Item created successfully'));
});

const getAllItems = asyncHandler(async (req, res) => {
  const items = await ItemService.getAllItems(req.query);
  res.status(200).json(new ApiResponse(200, items, 'Items fetched successfully'));
});

const getItemById = asyncHandler(async (req, res) => {
  const item = await ItemService.getItemById(req.params.id);
  res.status(200).json(new ApiResponse(200, item, 'Item details fetched successfully'));
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await ItemService.updateItem(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Item updated successfully'));
});

const deleteItem = asyncHandler(async (req, res) => {
  await ItemService.deleteItem(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Item deleted successfully'));
});

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
