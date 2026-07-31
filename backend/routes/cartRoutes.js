const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} = require('../controllers/cartController');
const verifyToken = require('../middleware/authMiddleware');

// Every cart route requires a logged-in user — the cart is tied to user_id.
router.get('/', verifyToken, getCart);
router.post('/', verifyToken, addToCart);
router.put('/:itemId', verifyToken, updateCartItem);
router.delete('/:itemId', verifyToken, removeCartItem);

module.exports = router;