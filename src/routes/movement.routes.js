const express = require('express');
const router = express.Router();
const { getAllMovements, getMovementById } = require('../controllers/movement.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');

router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
  getAllMovements
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
  getMovementById
);

module.exports = router;
