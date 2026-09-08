const Joi = require('joi');
const registerSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'Valid email is required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required',
  }),
}).unknown(false);

const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'Valid email is required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
