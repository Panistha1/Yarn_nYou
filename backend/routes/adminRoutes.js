const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  restoreUser
} = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

router.get('/stats', verifyToken, isAdmin, getDashboardStats);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.patch('/users/:id/role', verifyToken, isAdmin, updateUserRole);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.patch('/users/:id/restore', verifyToken, isAdmin, restoreUser);

module.exports = router;