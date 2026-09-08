const ReportService = require('../services/report.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getWarehouseStockReport = asyncHandler(async (req, res) => {
  const { warehouseId } = req.query;
  const report = await ReportService.getWarehouseStockReport(warehouseId, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, report, 'Warehouse-wise stock report generated successfully'));
});

const getStockValuationReport = asyncHandler(async (req, res) => {
  const report = await ReportService.getStockValuationReport(req.user);
  res.status(200).json(new ApiResponse(200, report, 'Stock valuation report generated successfully'));
});

const getFastMovingItemsReport = asyncHandler(async (req, res) => {
  const { days, limit } = req.query;
  const report = await ReportService.getFastMovingItemsReport(days, limit, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, report, 'Fast-moving items report generated successfully'));
});

module.exports = {
  getWarehouseStockReport,
  getStockValuationReport,
  getFastMovingItemsReport,
};
