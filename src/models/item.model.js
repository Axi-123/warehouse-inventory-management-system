const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit of measure is required'],
      trim: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, 'Unit price cannot be negative'],
    },
    reorderPoint: {
      type: Number,
      required: [true, 'Reorder point is required'],
      min: [0, 'Reorder point cannot be negative'],
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
