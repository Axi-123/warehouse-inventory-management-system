const express = require('express');
const router = express.Router();
const {
  getWarehouseStockReport,
  getStockValuationReport,
  getFastMovingItemsReport,
} = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');
const validate = require('../middlewares/validate.middleware');
const {
  warehouseStockReportSchema,
  fastMovingReportSchema,
} = require('../validators/report.validator');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER));

router.get('/warehouse-stock', validate(warehouseStockReportSchema, 'query'), getWarehouseStockReport);
router.get('/valuation', getStockValuationReport);
router.get('/fast-moving', validate(fastMovingReportSchema, 'query'), getFastMovingItemsReport);

module.exports = router;
