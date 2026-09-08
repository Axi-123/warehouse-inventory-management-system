const TransferRequest = require('../models/transferRequest.model');
const StockBalance = require('../models/stockBalance.model');
const StockMovement = require('../models/stockMovement.model');
const Warehouse = require('../models/warehouse.model');
const Item = require('../models/item.model');
const ApiError = require('../utils/apiError');
const TRANSFER_STATUS = require('../constants/transferStatus');
const MOVEMENT_TYPES = require('../constants/movementTypes');
const ROLES = require('../constants/roles');

const assertTransferAccess = (user, request, sourceOnly = false) => {
  if (user.role === ROLES.ADMIN) return;

  const assignedWarehouse = String(user.assignedWarehouse);
  const sourceWarehouse = request.fromWarehouse?._id || request.fromWarehouse;
  const destinationWarehouse = request.toWarehouse?._id || request.toWarehouse;
  const hasAccess = sourceOnly
    ? assignedWarehouse === String(sourceWarehouse)
    : assignedWarehouse === String(sourceWarehouse) || assignedWarehouse === String(destinationWarehouse);

  if (!hasAccess) throw new ApiError(403, 'You are not authorized to access this transfer');
};

class TransferService {
  static async createTransferRequest({ fromWarehouseId, toWarehouseId, itemId, quantity, userId, user }) {
    if (user.role !== ROLES.ADMIN && String(user.assignedWarehouse) !== String(fromWarehouseId)) {
      throw new ApiError(403, 'You can only create transfers from your assigned warehouse');
    }
    if (fromWarehouseId === toWarehouseId) {
      throw new ApiError(400, 'Source and destination warehouses cannot be the same');
    }

    const fromWarehouse = await Warehouse.findById(fromWarehouseId);
    const toWarehouse = await Warehouse.findById(toWarehouseId);
    if (!fromWarehouse || !fromWarehouse.isActive || !toWarehouse || !toWarehouse.isActive) {
      throw new ApiError(404, 'One or both warehouses not found or inactive');
    }

    const item = await Item.findById(itemId);
    if (!item || !item.isActive) {
      throw new ApiError(404, 'Item not found or inactive');
    }

    const sourceBalance = await StockBalance.findOne({
      warehouse: fromWarehouseId,
      item: itemId,
    });

    if (!sourceBalance || sourceBalance.quantity < quantity) {
      const available = sourceBalance ? sourceBalance.quantity : 0;
      throw new ApiError(
        400,
        `Source warehouse has insufficient stock. Available: ${available}, Requested: ${quantity}`
      );
    }

    const transferRequest = await TransferRequest.create({
      fromWarehouse: fromWarehouseId,
      toWarehouse: toWarehouseId,
      item: itemId,
      quantity,
      requestedBy: userId,
      status: TRANSFER_STATUS.PENDING,
    });

    return await transferRequest.populate([
      { path: 'fromWarehouse', select: 'name location' },
      { path: 'toWarehouse', select: 'name location' },
      { path: 'item', select: 'sku name unit' },
      { path: 'requestedBy', select: 'name email role' },
    ]);
  }

  static async getAllTransferRequests(query = {}, user) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.fromWarehouse) filter.fromWarehouse = query.fromWarehouse;
    if (query.toWarehouse) filter.toWarehouse = query.toWarehouse;
    if (user.role !== ROLES.ADMIN) {
      filter.$or = [{ fromWarehouse: user.assignedWarehouse }, { toWarehouse: user.assignedWarehouse }];
    }

    return await TransferRequest.find(filter)
      .populate('fromWarehouse', 'name location')
      .populate('toWarehouse', 'name location')
      .populate('item', 'sku name unit category')
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  static async getTransferRequestById(id, user) {
    const request = await TransferRequest.findById(id)
      .populate('fromWarehouse', 'name location')
      .populate('toWarehouse', 'name location')
      .populate('item', 'sku name unit category')
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email role');

    if (!request) {
      throw new ApiError(404, 'Transfer request not found');
    }

    assertTransferAccess(user, request);

    return request;
  }

  static async approveTransferRequest(id, userId, user) {
    const request = await TransferRequest.findById(id);
    if (!request) {
      throw new ApiError(404, 'Transfer request not found');
    }

    assertTransferAccess(user, request);

    if (request.status !== TRANSFER_STATUS.PENDING) {
      throw new ApiError(400, `Transfer request is already ${request.status.toLowerCase()}`);
    }

    const claimedRequest = await TransferRequest.findOneAndUpdate(
      { _id: id, status: TRANSFER_STATUS.PENDING },
      { status: TRANSFER_STATUS.PROCESSING },
      { new: true }
    );
    if (!claimedRequest) {
      throw new ApiError(409, 'Transfer request is already being processed or is no longer pending');
    }

    const sourceBalance = await StockBalance.findOne({
      warehouse: request.fromWarehouse,
      item: request.item,
    });

    if (!sourceBalance || sourceBalance.quantity < request.quantity) {
      await TransferRequest.updateOne({ _id: id, status: TRANSFER_STATUS.PROCESSING }, { status: TRANSFER_STATUS.PENDING });
      const available = sourceBalance ? sourceBalance.quantity : 0;
      throw new ApiError(
        400,
        `Cannot approve transfer: Source warehouse has insufficient stock (Available: ${available}, Requested: ${request.quantity})`
      );
    }

    const updatedSourceBalance = await StockBalance.findOneAndUpdate(
      { warehouse: request.fromWarehouse, item: request.item, quantity: { $gte: request.quantity } },
      { $inc: { quantity: -request.quantity } },
      { new: true }
    );

    if (!updatedSourceBalance) {
      await TransferRequest.updateOne({ _id: id, status: TRANSFER_STATUS.PROCESSING }, { status: TRANSFER_STATUS.PENDING });
      throw new ApiError(
        400,
        'Cannot approve transfer: Source warehouse stock was modified by another transaction'
      );
    }

    await StockBalance.findOneAndUpdate(
      { warehouse: request.toWarehouse, item: request.item },
      { $inc: { quantity: request.quantity } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    const refString = `TRANSFER_REQ#${request._id}`;

    await StockMovement.create({
      item: request.item,
      warehouse: request.fromWarehouse,
      movementType: MOVEMENT_TYPES.TRANSFER_OUT,
      quantity: request.quantity,
      reference: refString,
      reason: 'Inter-warehouse stock transfer out',
      performedBy: userId,
    });

    await StockMovement.create({
      item: request.item,
      warehouse: request.toWarehouse,
      movementType: MOVEMENT_TYPES.TRANSFER_IN,
      quantity: request.quantity,
      reference: refString,
      reason: 'Inter-warehouse stock transfer in',
      performedBy: userId,
    });

    request.status = TRANSFER_STATUS.APPROVED;
    request.reviewedBy = userId;
    await request.save();

    return await request.populate([
      { path: 'fromWarehouse', select: 'name location' },
      { path: 'toWarehouse', select: 'name location' },
      { path: 'item', select: 'sku name unit' },
      { path: 'requestedBy', select: 'name email role' },
      { path: 'reviewedBy', select: 'name email role' },
    ]);
  }

  static async rejectTransferRequest(id, rejectionReason, userId, user) {
    const request = await TransferRequest.findById(id);
    if (!request) {
      throw new ApiError(404, 'Transfer request not found');
    }

    assertTransferAccess(user, request);

    if (request.status !== TRANSFER_STATUS.PENDING) {
      throw new ApiError(400, `Transfer request is already ${request.status.toLowerCase()}`);
    }

    request.status = TRANSFER_STATUS.REJECTED;
    request.rejectionReason = rejectionReason;
    request.reviewedBy = userId;
    await request.save();

    return await request.populate([
      { path: 'fromWarehouse', select: 'name location' },
      { path: 'toWarehouse', select: 'name location' },
      { path: 'item', select: 'sku name unit' },
      { path: 'requestedBy', select: 'name email role' },
      { path: 'reviewedBy', select: 'name email role' },
    ]);
  }
}

module.exports = TransferService;
