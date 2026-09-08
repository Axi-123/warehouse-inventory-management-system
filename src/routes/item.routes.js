const express = require('express');
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require('../controllers/item.controller');
const validate = require('../middlewares/validate.middleware');
const { createItemSchema, updateItemSchema } = require('../validators/item.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');

router.use(authenticate);

router
  .route('/')
  .post(authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER), validate(createItemSchema), createItem)
  .get(authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF), getAllItems);

router
  .route('/:id')
  .get(authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF), getItemById)
  .put(authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER), validate(updateItemSchema), updateItem)
  .delete(authorize(ROLES.ADMIN), deleteItem);

module.exports = router;
