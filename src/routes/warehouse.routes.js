const express = require('express');
const router = express.Router();
const {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
} = require('../controllers/warehouse.controller');
const validate = require('../middlewares/validate.middleware');
const { createWarehouseSchema, updateWarehouseSchema } = require('../validators/warehouse.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');

router.use(authenticate);

router
  .route('/')
  .post(authorize(ROLES.ADMIN), validate(createWarehouseSchema), createWarehouse)
  .get(authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF), getAllWarehouses);

router
  .route('/:id')
  .get(authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF), getWarehouseById)
  .put(authorize(ROLES.ADMIN), validate(updateWarehouseSchema), updateWarehouse)
  .delete(authorize(ROLES.ADMIN), deleteWarehouse);

module.exports = router;
