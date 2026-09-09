const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

const errorCodeMap = {
    400: 'VALIDATION_ERROR',
    401: 'UNAUTHENTICATED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
  };

  const response = {
    success: false,
    statusCode: error.statusCode,
    errorCode: errorCodeMap[error.statusCode] || 'INTERNAL_ERROR',
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
  
  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
