const Joi = require('joi');

const warehouseStockReportSchema = Joi.object({
  warehouseId: Joi.string().hex().length(24).optional(),
});

const fastMovingReportSchema = Joi.object({
  days: Joi.number().integer().min(1).max(3650).optional().default(30),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
});

module.exports = {
  warehouseStockReportSchema,
  fastMovingReportSchema,
};