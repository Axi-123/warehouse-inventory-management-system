const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const warehouseRoutes = require('./warehouse.routes');
const itemRoutes = require('./item.routes');
const stockRoutes = require('./stock.routes');
const transferRoutes = require('./transfer.routes');
const movementRoutes = require('./movement.routes');
const reportRoutes = require('./report.routes');
const userRoutes = require('./user.routes');

router.use('/auth', authRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/items', itemRoutes);
router.use('/stock', stockRoutes);
router.use('/transfers', transferRoutes);
router.use('/movements', movementRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

module.exports = router;
