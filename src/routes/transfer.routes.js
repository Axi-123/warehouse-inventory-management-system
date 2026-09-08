const express = require('express');
const router = express.Router();
const {
  createTransferRequest,
  getAllTransferRequests,
  getTransferRequestById,
  approveTransferRequest,
  rejectTransferRequest,
} = require('../controllers/transfer.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createTransferSchema,
  rejectTransferSchema,
} = require('../validators/transfer.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');

router.use(authenticate);

router
  .route('/')
  .post(
    authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
    validate(createTransferSchema),
    createTransferRequest
  )
  .get(
    authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
    getAllTransferRequests
  );

router
  .route('/:id')
  .get(
    authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
    getTransferRequestById
  );

router.patch(
  '/:id/approve',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER),
  approveTransferRequest
);

router.patch(
  '/:id/reject',
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER),
  validate(rejectTransferSchema),
  rejectTransferRequest
);

module.exports = router;
