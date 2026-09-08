const ApiError = require('../utils/apiError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new ApiError(400, errorMessage, error.details));
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
