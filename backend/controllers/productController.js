const pool = require('../config/db');

// POST /api/products  (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      stock,
      material,
      color,
      featured
    } = req.body;

    if (!category_id || !name || !price) {
      return res.status(400).json({ message: 'category_id, name and price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO products
        (category_id, name, description, price, stock, material, color, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        description || null,
        price,
        stock || 0,
        material || null,
        color || null,
        featured === 'true' || featured === true
      ]
    );

    const productId = result.insertId;

    // Auto-generate a SKU now that we have the product_id, e.g. 'YN-0007'
    const sku = `YN-${String(productId).padStart(4, '0')}`;
    await pool.query('UPDATE products SET sku = ? WHERE product_id = ?', [sku, productId]);

    // req.files comes from multer (upload.array('images', ...) in the route)
    if (req.files && req.files.length > 0) {
      const imageRows = req.files.map((file, index) => [
        productId,
        `/uploads/products/${file.filename}`,
        index === 0 // first uploaded image becomes the primary one
      ]);

      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
        [imageRows]
      );
    }

    res.status(201).json({
      message: 'Product created successfully',
      productId,
      sku
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// GET /api/products
// GET /api/products?includeDeleted=true  (Admin product list, so soft-deleted
// products can still be seen and restored instead of vanishing forever)
exports.getAllProducts = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';

    const [rows] = await pool.query(
      `SELECT p.*, c.category_name,
        (SELECT pi.image_url FROM product_images pi
         WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE
         LIMIT 1) AS primary_image
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       ${includeDeleted ? '' : 'WHERE p.deleted_at IS NULL'}
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE product_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ?',
      [id]
    );

    res.json({ ...rows[0], images });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// PUT /api/products/:id  (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      stock,
      material,
      color,
      featured
    } = req.body;

    if (!category_id || !name || !price) {
      return res.status(400).json({ message: 'category_id, name and price are required' });
    }

    const [result] = await pool.query(
      `UPDATE products
       SET category_id = ?, name = ?, description = ?, price = ?, stock = ?,
           material = ?, color = ?, featured = ?
       WHERE product_id = ?`,
      [
        category_id,
        name,
        description || null,
        price,
        stock || 0,
        material || null,
        color || null,
        featured === 'true' || featured === true,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Any newly uploaded images get appended (existing images stay unless
    // removed separately via DELETE /api/products/:id/images/:imageId)
    if (req.files && req.files.length > 0) {
      const [[{ hasPrimary }]] = await pool.query(
        `SELECT COUNT(*) AS hasPrimary FROM product_images
         WHERE product_id = ? AND is_primary = TRUE`,
        [id]
      );

      const imageRows = req.files.map((file, index) => [
        id,
        `/uploads/products/${file.filename}`,
        !hasPrimary && index === 0 // only auto-set primary if none exists yet
      ]);

      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
        [imageRows]
      );
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// DELETE /api/products/:id/images/:imageId  (Admin only)
exports.deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM product_images WHERE image_id = ? AND product_id = ?',
      [imageId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // If we just deleted the primary image, promote another one if available
    const [[remaining]] = await pool.query(
      `SELECT image_id FROM product_images WHERE product_id = ? LIMIT 1`,
      [id]
    );

    if (remaining) {
      const [[stillHasPrimary]] = await pool.query(
        `SELECT COUNT(*) AS count FROM product_images WHERE product_id = ? AND is_primary = TRUE`,
        [id]
      );
      if (stillHasPrimary.count === 0) {
        await pool.query(
          'UPDATE product_images SET is_primary = TRUE WHERE image_id = ?',
          [remaining.image_id]
        );
      }
    }

    res.json({ message: 'Image removed' });
  } catch (err) {
    console.error('Delete product image error:', err);
    res.status(500).json({ message: 'Server error removing image' });
  }
};

// DELETE /api/products/:id  (Admin only)
// Soft delete: the row stays in the DB (deleted_at gets a timestamp) instead
// of being physically removed. This keeps order_items.product_id joins
// working forever for past orders, so there's no more need to block
// deletion just because a product has order history.
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE products SET deleted_at = NOW() WHERE product_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or already deleted' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// PATCH /api/products/:id/restore  (Admin only)
exports.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE products SET deleted_at = NULL WHERE product_id = ? AND deleted_at IS NOT NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or not deleted' });
    }

    res.json({ message: 'Product restored successfully' });
  } catch (err) {
    console.error('Restore product error:', err);
    res.status(500).json({ message: 'Server error restoring product' });
  }
};