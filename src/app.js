const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/apiError');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Warehouse Inventory Management API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', routes);

// Handle 404 routes
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl} on this server`));
});

// Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
