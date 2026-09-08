const StockService = require('../services/stock.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const recordStockIn = asyncHandler(async (req, res) => {
  const result = await StockService.recordStockIn({
    ...req.body,
    userId: req.user._id,
    user: req.user,
  });
  res.status(200).json(new ApiResponse(200, result, 'Stock-in recorded successfully'));
});

const recordStockOut = asyncHandler(async (req, res) => {
  const result = await StockService.recordStockOut({
    ...req.body,
    userId: req.user._id,
    user: req.user,
  });
  res.status(200).json(new ApiResponse(200, result, 'Stock-out recorded successfully'));
});

const getRunningStockBalances = asyncHandler(async (req, res) => {
  const balances = await StockService.getRunningStockBalances(req.query, req.user);
  res.status(200).json(new ApiResponse(200, balances, 'Stock balances fetched successfully'));
});

const getLowStockAlerts = asyncHandler(async (req, res) => {
  const alerts = await StockService.getLowStockAlerts(req.query, req.user);
  res.status(200).json(new ApiResponse(200, alerts, 'Low-stock alerts fetched successfully'));
});

const adjustStock = asyncHandler(async (req, res) => {
  const result = await StockService.adjustStock({
    ...req.body,
    userId: req.user._id,
    user: req.user,
  });
  res.status(200).json(new ApiResponse(200, result, 'Stock adjustment recorded successfully'));
});

module.exports = {
  recordStockIn,
  recordStockOut,
  getRunningStockBalances,
  getLowStockAlerts,
  adjustStock,
};
