const Joi = require('joi');

const createWarehouseSchema = Joi.object({
  name: Joi.string().required().trim(),
  location: Joi.string().required().trim(),
  capacity: Joi.number().min(0).required(),
});

const updateWarehouseSchema = Joi.object({
  name: Joi.string().optional().trim(),
  location: Joi.string().optional().trim(),
  capacity: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createWarehouseSchema,
  updateWarehouseSchema,
};
