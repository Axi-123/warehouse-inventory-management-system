const Warehouse = require('../models/warehouse.model');
const ApiError = require('../utils/apiError');

class WarehouseService {
  static async createWarehouse(warehouseData) {
    const existing = await Warehouse.findOne({ name: warehouseData.name });
    if (existing) {
      throw new ApiError(400, 'Warehouse with this name already exists');
    }
    return await Warehouse.create(warehouseData);
  }

  static async getAllWarehouses(filter = {}) {
    return await Warehouse.find({ isActive: true, ...filter }).sort({ createdAt: -1 });
  }

  static async getWarehouseById(id) {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse || !warehouse.isActive) {
      throw new ApiError(404, 'Warehouse not found');
    }
    return warehouse;
  }

  static async updateWarehouse(id, updateData) {
    if (updateData.name) {
      const existing = await Warehouse.findOne({ name: updateData.name, _id: { $ne: id } });
      if (existing) {
        throw new ApiError(400, 'Warehouse with this name already exists');
      }
    }

    const warehouse = await Warehouse.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }
    return warehouse;
  }

  static async deleteWarehouse(id) {
    const warehouse = await Warehouse.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }
    return warehouse;
  }
}

module.exports = WarehouseService;
