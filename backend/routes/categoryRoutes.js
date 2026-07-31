const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
} = require('../controllers/categoryController');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// Categories are public — anyone browsing the shop needs to see them,
// logged in or not.
router.get('/', getAllCategories);

// Managing categories is Admin only.
router.post('/', verifyToken, isAdmin, createCategory);
router.put('/:id', verifyToken, isAdmin, updateCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);
router.patch('/:id/restore', verifyToken, isAdmin, restoreCategory);

module.exports = router;