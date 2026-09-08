const WarehouseService = require('../services/warehouse.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await WarehouseService.createWarehouse(req.body);
  res.status(201).json(new ApiResponse(201, warehouse, 'Warehouse created successfully'));
});

const getAllWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await WarehouseService.getAllWarehouses();
  res.status(200).json(new ApiResponse(200, warehouses, 'Warehouses fetched successfully'));
});

const getWarehouseById = asyncHandler(async (req, res) => {
  const warehouse = await WarehouseService.getWarehouseById(req.params.id);
  res.status(200).json(new ApiResponse(200, warehouse, 'Warehouse details fetched successfully'));
});

const updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await WarehouseService.updateWarehouse(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, warehouse, 'Warehouse updated successfully'));
});

const deleteWarehouse = asyncHandler(async (req, res) => {
  await WarehouseService.deleteWarehouse(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Warehouse deleted successfully'));
});

module.exports = {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
};
