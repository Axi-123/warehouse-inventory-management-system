const mongoose = require('mongoose');

const stockBalanceSchema = new mongoose.Schema(
  {
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item is required'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

stockBalanceSchema.index({ warehouse: 1, item: 1 }, { unique: true });

const StockBalance = mongoose.model('StockBalance', stockBalanceSchema);
module.exports = StockBalance;
