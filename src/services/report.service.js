const StockBalance = require('../models/stockBalance.model');
const StockMovement = require('../models/stockMovement.model');
const MOVEMENT_TYPES = require('../constants/movementTypes');
const ROLES = require('../constants/roles');
const ApiError = require('../utils/apiError');

const getWarehouseFilter = (warehouseId, user) => {
  if (user.role === ROLES.WAREHOUSE_MANAGER) {
    if (warehouseId && String(warehouseId) !== String(user.assignedWarehouse)) {
      throw new ApiError(403, 'You are not authorized to access this warehouse');
    }
    return user.assignedWarehouse;
  }
  return warehouseId;
};

class ReportService {
  static async getWarehouseStockReport(warehouseId, user) {
    const filter = {};
    warehouseId = getWarehouseFilter(warehouseId, user);
    if (warehouseId) filter.warehouse = warehouseId;

    const balances = await StockBalance.find(filter)
      .populate('warehouse', 'name location capacity')
      .populate('item', 'sku name category unit unitPrice reorderPoint');

    const warehouseMap = {};

    balances.forEach((balance) => {
      if (!balance.warehouse || !balance.item) return;

      const wId = balance.warehouse._id.toString();
      if (!warehouseMap[wId]) {
        warehouseMap[wId] = {
          warehouse: balance.warehouse,
          totalSKUs: 0,
          totalQuantity: 0,
          totalValuation: 0,
          items: [],
        };
      }

      const itemValuation = balance.quantity * (balance.item.unitPrice || 0);

      warehouseMap[wId].totalSKUs += 1;
      warehouseMap[wId].totalQuantity += balance.quantity;
      warehouseMap[wId].totalValuation += itemValuation;
      warehouseMap[wId].items.push({
        item: balance.item,
        quantity: balance.quantity,
        valuation: itemValuation,
        isLowStock: balance.quantity <= balance.item.reorderPoint,
      });
    });

    return Object.values(warehouseMap);
  }

  static async getStockValuationReport(user) {
    const filter = user.role === ROLES.WAREHOUSE_MANAGER
      ? { warehouse: user.assignedWarehouse }
      : {};
    const balances = await StockBalance.find(filter)
      .populate('warehouse', 'name location')
      .populate('item', 'sku name category unit unitPrice');

    let totalSystemValuation = 0;
    let totalSystemQuantity = 0;
    const warehouseValuations = {};

    balances.forEach((balance) => {
      if (!balance.warehouse || !balance.item) return;

      const wId = balance.warehouse._id.toString();
      const itemValuation = balance.quantity * (balance.item.unitPrice || 0);

      totalSystemValuation += itemValuation;
      totalSystemQuantity += balance.quantity;

      if (!warehouseValuations[wId]) {
        warehouseValuations[wId] = {
          warehouse: balance.warehouse,
          totalItems: 0,
          totalQuantity: 0,
          totalValuation: 0,
        };
      }

      warehouseValuations[wId].totalItems += 1;
      warehouseValuations[wId].totalQuantity += balance.quantity;
      warehouseValuations[wId].totalValuation += itemValuation;
    });

    return {
      summary: {
        totalSystemQuantity,
        totalSystemValuation,
      },
      warehouseBreakdown: Object.values(warehouseValuations),
    };
  }

  static async getFastMovingItemsReport(days = 30, limit = 10, user) {
    const parsedDays = Number(days);
    const parsedLimit = Number(limit);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parsedDays);

    const result = await StockMovement.aggregate([
      {
        $match: {
          movementType: { $in: [MOVEMENT_TYPES.OUT, MOVEMENT_TYPES.TRANSFER_OUT] },
          createdAt: { $gte: startDate },
          ...(user.role === ROLES.WAREHOUSE_MANAGER && { warehouse: user.assignedWarehouse }),
        },
      },
      {
        $group: {
          _id: '$item',
          totalQuantityOut: { $sum: '$quantity' },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantityOut: -1 } },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: 0,
          itemId: '$_id',
          sku: '$itemDetails.sku',
          name: '$itemDetails.name',
          category: '$itemDetails.category',
          unit: '$itemDetails.unit',
          unitPrice: '$itemDetails.unitPrice',
          totalQuantityOut: 1,
          transactionCount: 1,
        },
      },
    ]);

    return {
      periodDays: parsedDays,
      topFastMovingItems: result,
    };
  }
}

module.exports = ReportService;
