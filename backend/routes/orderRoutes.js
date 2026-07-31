const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createOrder,
  getMyOrders,
  getMyOrderById,
  verifyKhaltiPayment
} = require('../controllers/orderController');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// Customer routes (must come before /:id so "my" isn't treated as an id)
router.post('/', verifyToken, createOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/my/:id', verifyToken, getMyOrderById);

// Khalti redirects the customer's browser here after payment/cancellation —
// there's no Authorization header on that request, so this stays public.
router.get('/khalti/verify', verifyKhaltiPayment);

// Admin only
router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/:id', verifyToken, isAdmin, getOrderById);
router.patch('/:id/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;