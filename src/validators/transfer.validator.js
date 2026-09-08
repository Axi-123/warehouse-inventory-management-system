const Joi = require('joi');

const createTransferSchema = Joi.object({
  fromWarehouseId: Joi.string().hex().length(24).required(),
  toWarehouseId: Joi.string().hex().length(24).required().invalid(Joi.ref('fromWarehouseId')).messages({
    'any.invalid': 'Destination warehouse must be different from source warehouse',
  }),
  itemId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().positive().required(),
});

const rejectTransferSchema = Joi.object({
  rejectionReason: Joi.string().required().trim().messages({
    'string.empty': 'Rejection reason is required',
  }),
});

module.exports = {
  createTransferSchema,
  rejectTransferSchema,
};
