const StockMovement = require('../models/stockMovement.model');
const ApiError = require('../utils/apiError');
const ROLES = require('../constants/roles');

class MovementService {
  static async getAllMovements(query = {}, user) {
    const { warehouseId, itemId, movementType, startDate, endDate, page = 1, limit = 20 } = query;
    const filter = {};

    if (user.role !== ROLES.ADMIN) filter.warehouse = user.assignedWarehouse;

    if (warehouseId) filter.warehouse = warehouseId;
    if (user.role !== ROLES.ADMIN && String(filter.warehouse) !== String(user.assignedWarehouse)) {
      throw new ApiError(403, 'You are not authorized to access this warehouse');
    }
    if (itemId) filter.item = itemId;
    if (movementType) filter.movementType = movementType;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [movements, total] = await Promise.all([
      StockMovement.find(filter)
        .populate('warehouse', 'name location')
        .populate('item', 'sku name unit category')
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      StockMovement.countDocuments(filter),
    ]);

    return {
      movements,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  static async getMovementById(id, user) {
    const filter = { _id: id };
    if (user.role !== ROLES.ADMIN) filter.warehouse = user.assignedWarehouse;

    const movement = await StockMovement.findOne(filter)
      .populate('warehouse', 'name location')
      .populate('item', 'sku name unit category')
      .populate('performedBy', 'name email role');

    if (!movement) throw new ApiError(404, 'Movement not found');
    return movement;
  }
}

module.exports = MovementService;
