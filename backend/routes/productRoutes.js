const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  deleteProductImage
} = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/upload');

router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only — requires login AND role = 'Admin'
router.post('/', verifyToken, isAdmin, upload.array('images', 5), createProduct);
router.put('/:id', verifyToken, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id/images/:imageId', verifyToken, isAdmin, deleteProductImage);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);
router.patch('/:id/restore', verifyToken, isAdmin, restoreProduct);

module.exports = router;