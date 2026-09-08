const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const ROLES = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', toggleUserStatus);

module.exports = router;
