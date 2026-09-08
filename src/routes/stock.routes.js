const express = require('express');
const router = express.Router();
const {
  recordStockIn,
  recordStockOut,
  getRunningStockBalances,
  getLowStockAlerts,
  adjustStock,
} = require('../controllers/stock.controller');
const validate = require('../middlewares/validate.middleware');
const {
  stockInSchema,
  stockOutSchema,
  stockAdjustSchema,
} = require('../validators/stock.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');

router.use(authenticate);

router.post(
  '/in',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
  validate(stockInSchema),
  recordStockIn
);

router.post(
  '/out',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
  validate(stockOutSchema),
  recordStockOut
);

router.get(
  '/balance',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
  getRunningStockBalances
);

router.get(
  '/low-stock',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
  getLowStockAlerts
);

router.post(
  '/adjust',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER),
  validate(stockAdjustSchema),
  adjustStock
);

module.exports = router;
