const Joi = require('joi');

const stockInSchema = Joi.object({
  warehouseId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Warehouse ID is required',
  }),
  itemId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Item ID is required',
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantity must be a positive integer',
  }),
  reference: Joi.string().optional().allow('').trim(),
  batchNumber: Joi.string().optional().allow('').trim(),
});

const stockOutSchema = Joi.object({
  warehouseId: Joi.string().hex().length(24).required(),
  itemId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().positive().required(),
  reference: Joi.string().optional().allow('').trim(),
  reason: Joi.string().optional().allow('').trim(),
});

const stockAdjustSchema = Joi.object({
  warehouseId: Joi.string().hex().length(24).required(),
  itemId: Joi.string().hex().length(24).required(),
  newQuantity: Joi.number().integer().min(0).required().messages({
    'number.min': 'New quantity cannot be negative',
  }),
  reason: Joi.string().required().trim().messages({
    'string.empty': 'Adjustment reason is required',
  }),
});

module.exports = {
  stockInSchema,
  stockOutSchema,
  stockAdjustSchema,
};
