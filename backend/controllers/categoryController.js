const pool = require('../config/db');

const DEFAULT_CATEGORIES = [
  { category_id: 1, category_name: 'Animals',  description: 'Animal Crochet' },
  { category_id: 2, category_name: 'Flowers',  description: 'Flower Crochet' },
  { category_id: 3, category_name: 'Food',     description: 'Food Crochet' },
  { category_id: 4, category_name: 'Anime',    description: 'Anime Crochet' },
  { category_id: 5, category_name: 'Custom',   description: 'Custom Crochet' },
];

// GET /api/categories
// GET /api/categories?includeDeleted=true  (Admin category manager, so
// soft-deleted categories can still be seen and restored)
exports.getAllCategories = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';

    const [rows] = await pool.query(
      `SELECT * FROM categories
       ${includeDeleted ? '' : 'WHERE deleted_at IS NULL'}
       ORDER BY category_name ASC`
    );

    // If the table exists but has no active rows yet, auto-seed it and
    // return defaults. Checked against the unfiltered table so we don't
    // re-seed over categories that were only soft-deleted.
    if (rows.length === 0 && !includeDeleted) {
      const [[{ totalCount }]] = await pool.query(
        'SELECT COUNT(*) AS totalCount FROM categories'
      );

      if (totalCount === 0) {
        await pool.query(
          'INSERT IGNORE INTO categories (category_name, description) VALUES ?',
          [DEFAULT_CATEGORIES.map(c => [c.category_name, c.description])]
        );

        const [seeded] = await pool.query(
          'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY category_name ASC'
        );

        return res.json(seeded);
      }
    }

    res.json(rows);
  } catch (err) {
    console.error('Get categories error:', err);

    // Even if DB fails completely, return the hardcoded list so the
    // Add Product / Edit Product forms are never broken.
    res.json(DEFAULT_CATEGORIES);
  }
};

// POST /api/categories  (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name.trim(), description || null]
    );

    res.status(201).json({
      category_id: result.insertId,
      category_name: category_name.trim(),
      description: description || null
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A category with that name already exists' });
    }
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// PUT /api/categories/:id  (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [result] = await pool.query(
      'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
      [category_name.trim(), description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A category with that name already exists' });
    }
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// DELETE /api/categories/:id  (Admin only)
// Soft delete: the row stays (deleted_at gets a timestamp) instead of
// being physically removed, so it stays recoverable and any products
// still pointing at it (however unlikely, see the guard below) never
// end up referencing a category that's actually gone.
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // A category with active (non-deleted) products in it shouldn't be
    // hidden out from under them — move or delete those products first.
    const [[{ productCount }]] = await pool.query(
      'SELECT COUNT(*) AS productCount FROM products WHERE category_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (productCount > 0) {
      return res.status(409).json({
        message: `This category has ${productCount} active product(s) in it and can't be deleted. Move or delete those products first.`
      });
    }

    const [result] = await pool.query(
      'UPDATE categories SET deleted_at = NOW() WHERE category_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found or already deleted' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};

// PATCH /api/categories/:id/restore  (Admin only)
exports.restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE categories SET deleted_at = NULL WHERE category_id = ? AND deleted_at IS NOT NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found or not deleted' });
    }

    res.json({ message: 'Category restored successfully' });
  } catch (err) {
    console.error('Restore category error:', err);
    res.status(500).json({ message: 'Server error restoring category' });
  }
};