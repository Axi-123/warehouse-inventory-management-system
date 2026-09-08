const Joi = require('joi');

const createItemSchema = Joi.object({
  sku: Joi.string().required().trim().uppercase(),
  name: Joi.string().required().trim(),
  category: Joi.string().required().trim(),
  unit: Joi.string().required().trim(),
  unitPrice: Joi.number().min(0).optional().default(0),
  reorderPoint: Joi.number().min(0).optional().default(10),
});

const updateItemSchema = Joi.object({
  sku: Joi.string().optional().trim().uppercase(),
  name: Joi.string().optional().trim(),
  category: Joi.string().optional().trim(),
  unit: Joi.string().optional().trim(),
  unitPrice: Joi.number().min(0).optional(),
  reorderPoint: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createItemSchema,
  updateItemSchema,
};
