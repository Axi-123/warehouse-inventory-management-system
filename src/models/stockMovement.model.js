const mongoose = require('mongoose');
const MOVEMENT_TYPES = require('../constants/movementTypes');

const stockMovementSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item is required'],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },
    movementType: {
      type: String,
      enum: Object.values(MOVEMENT_TYPES),
      required: [true, 'Movement type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    reference: {
      type: String,
      trim: true,
      default: '',
    },
    batchNumber: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who performed movement is required'],
    },
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.index({ warehouse: 1, createdAt: -1 });
stockMovementSchema.index({ item: 1, movementType: 1, createdAt: -1 });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

module.exports = StockMovement;
