const StockBalance = require('../models/stockBalance.model');
const StockMovement = require('../models/stockMovement.model');
const Warehouse = require('../models/warehouse.model');
const Item = require('../models/item.model');
const ApiError = require('../utils/apiError');
const MOVEMENT_TYPES = require('../constants/movementTypes');
const ROLES = require('../constants/roles');

const assertWarehouseAccess = (user, warehouseId) => {
  if (user.role !== ROLES.ADMIN && String(user.assignedWarehouse) !== String(warehouseId)) {
    throw new ApiError(403, 'You are not authorized to access this warehouse');
  }
};

class StockService {
  static async recordStockIn({ warehouseId, itemId, quantity, reference, batchNumber, userId, user }) {
    assertWarehouseAccess(user, warehouseId);
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || !warehouse.isActive) {
      throw new ApiError(404, 'Warehouse not found or inactive');
    }

    const item = await Item.findById(itemId);
    if (!item || !item.isActive) {
      throw new ApiError(404, 'Item not found or inactive');
    }

    const updatedBalance = await StockBalance.findOneAndUpdate(
      { warehouse: warehouseId, item: itemId },
      { $inc: { quantity: quantity } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const movement = await StockMovement.create({
      item: itemId,
      warehouse: warehouseId,
      movementType: MOVEMENT_TYPES.IN,
      quantity,
      reference,
      batchNumber,
      performedBy: userId,
    });

    return { balance: updatedBalance, movement };
  }

  static async recordStockOut({ warehouseId, itemId, quantity, reference, reason, userId, user }) {
    assertWarehouseAccess(user, warehouseId);
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || !warehouse.isActive) {
      throw new ApiError(404, 'Warehouse not found or inactive');
    }

    const item = await Item.findById(itemId);
    if (!item || !item.isActive) {
      throw new ApiError(404, 'Item not found or inactive');
    }

    const currentBalance = await StockBalance.findOne({ warehouse: warehouseId, item: itemId });
    if (!currentBalance || currentBalance.quantity < quantity) {
      const available = currentBalance ? currentBalance.quantity : 0;
      throw new ApiError(
        400,
        `Insufficient stock quantity. Available: ${available}, Requested: ${quantity}`
      );
    }

    const updatedBalance = await StockBalance.findOneAndUpdate(
      { warehouse: warehouseId, item: itemId, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );

    if (!updatedBalance) {
      throw new ApiError(400, 'Stock update failed due to concurrent stock change. Please retry');
    }

    const movement = await StockMovement.create({
      item: itemId,
      warehouse: warehouseId,
      movementType: MOVEMENT_TYPES.OUT,
      quantity,
      reference,
      reason,
      performedBy: userId,
    });

    return { balance: updatedBalance, movement };
  }

  static async getRunningStockBalances({ warehouseId, itemId }, user) {
    const filter = {};
    const isAdmin = !user || user.role === ROLES.ADMIN;
    if (!isAdmin) filter.warehouse = user.assignedWarehouse;
    if (warehouseId) filter.warehouse = warehouseId;
    if (itemId) filter.item = itemId;

    if (!isAdmin && String(filter.warehouse) !== String(user.assignedWarehouse)) {
      throw new ApiError(403, 'You are not authorized to access this warehouse');
    }

    return await StockBalance.find(filter)
      .populate('warehouse', 'name location')
      .populate('item', 'sku name category unit unitPrice reorderPoint')
      .sort({ updatedAt: -1 });
  }

  static async getLowStockAlerts({ warehouseId }, user) {
    const filter = {};
    const isAdmin = !user || user.role === ROLES.ADMIN;
    if (!isAdmin) filter.warehouse = user.assignedWarehouse;
    if (warehouseId) filter.warehouse = warehouseId;

    if (!isAdmin && String(filter.warehouse) !== String(user.assignedWarehouse)) {
      throw new ApiError(403, 'You are not authorized to access this warehouse');
    }

    const balances = await StockBalance.find(filter)
      .populate('warehouse', 'name location')
      .populate('item', 'sku name category unit unitPrice reorderPoint');

    const lowStockItems = balances.filter((b) => b.item && b.quantity <= b.item.reorderPoint);

    return lowStockItems.map((b) => ({
      stockBalanceId: b._id,
      warehouse: b.warehouse,
      item: b.item,
      currentQuantity: b.quantity,
      reorderPoint: b.item.reorderPoint,
      deficit: Math.max(0, b.item.reorderPoint - b.quantity),
      status: b.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
    }));
  }

  static async adjustStock({ warehouseId, itemId, newQuantity, reason, userId, user }) {
    assertWarehouseAccess(user, warehouseId);
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || !warehouse.isActive) {
      throw new ApiError(404, 'Warehouse not found or inactive');
    }

    const item = await Item.findById(itemId);
    if (!item || !item.isActive) {
      throw new ApiError(404, 'Item not found or inactive');
    }

    let stockBalance = await StockBalance.findOne({ warehouse: warehouseId, item: itemId });
    const oldQuantity = stockBalance ? stockBalance.quantity : 0;
    const diff = newQuantity - oldQuantity;

    stockBalance = await StockBalance.findOneAndUpdate(
      { warehouse: warehouseId, item: itemId },
      { quantity: newQuantity },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const movement = await StockMovement.create({
      item: itemId,
      warehouse: warehouseId,
      movementType: MOVEMENT_TYPES.ADJUSTMENT,
      quantity: Math.abs(diff),
      reason: `${reason} (Audit Adjustment: ${oldQuantity} -> ${newQuantity})`,
      performedBy: userId,
    });

    return { balance: stockBalance, movement, adjustmentDelta: diff };
  }
}

module.exports = StockService;
