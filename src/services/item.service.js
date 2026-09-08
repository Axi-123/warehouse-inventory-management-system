const Item = require('../models/item.model');
const ApiError = require('../utils/apiError');

class ItemService {
  static async createItem(itemData) {
    const existing = await Item.findOne({ sku: itemData.sku.toUpperCase() });
    if (existing) {
      throw new ApiError(400, 'Item with this SKU already exists');
    }
    return await Item.create(itemData);
  }

  static async getAllItems(query = {}) {
    const { category, search } = query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    return await Item.find(filter).sort({ createdAt: -1 });
  }

  static async getItemById(id) {
    const item = await Item.findById(id);
    if (!item || !item.isActive) {
      throw new ApiError(404, 'Item not found');
    }
    return item;
  }

  static async updateItem(id, updateData) {
    if (updateData.sku) {
      updateData.sku = updateData.sku.toUpperCase();
      const existing = await Item.findOne({ sku: updateData.sku, _id: { $ne: id } });
      if (existing) {
        throw new ApiError(400, 'Item with this SKU already exists');
      }
    }

    const item = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      throw new ApiError(404, 'Item not found');
    }
    return item;
  }

  static async deleteItem(id) {
    const item = await Item.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!item) {
      throw new ApiError(404, 'Item not found');
    }
    return item;
  }
}

module.exports = ItemService;
