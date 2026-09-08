require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { runLowStockCheck } = require('./jobs/lowStockChecker');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Warehouse & Inventory Management System API Server `);
    console.log(` Running on port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });

  // Run once after startup, then check inventory every 15 minutes.
  setTimeout(runLowStockCheck, 5000);
  setInterval(runLowStockCheck, 15 * 60 * 1000);

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
