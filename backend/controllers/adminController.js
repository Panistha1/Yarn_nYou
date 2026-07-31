const pool = require('../config/db');

const LOW_STOCK_THRESHOLD = 5;

// GET /api/admin/stats  (Admin only)
// Now includes order + revenue stats (the orders system is fully built —
// this endpoint just hadn't been updated since that work landed).
exports.getDashboardStats = async (req, res) => {
  try {
    const [[productCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE deleted_at IS NULL'
    );

    const [[activeCategoryCount]] = await pool.query(
      'SELECT COUNT(DISTINCT category_id) AS count FROM products WHERE deleted_at IS NULL'
    );

    const [[totalCategoryCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM categories WHERE deleted_at IS NULL'
    );

    const [[customerCount]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'Customer'"
    );

    const [[lowStockCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE deleted_at IS NULL AND stock > 0 AND stock <= ?',
      [LOW_STOCK_THRESHOLD]
    );

    const [[outOfStockCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE deleted_at IS NULL AND stock = 0'
    );

    const [[totalOrders]] = await pool.query('SELECT COUNT(*) AS count FROM orders');

    const [[pendingOrders]] = await pool.query(
      "SELECT COUNT(*) AS count FROM orders WHERE status IN ('Pending', 'Processing')"
    );

    // Revenue = money actually confirmed paid (same rule as the Orders
    // page), bucketed to the current calendar month.
    const [[monthRevenue]] = await pool.query(
      `SELECT COALESCE(SUM(o.total_amount), 0) AS total
       FROM orders o
       JOIN payments p ON p.order_id = o.order_id
       WHERE p.payment_status = 'Paid'
       AND MONTH(p.payment_date) = MONTH(CURRENT_DATE())
       AND YEAR(p.payment_date) = YEAR(CURRENT_DATE())`
    );

    const [recentProducts] = await pool.query(
      `SELECT product_id, name, price, stock, created_at
       FROM products
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 5`
    );

    res.json({
      totalProducts: productCount.count,
      activeCategories: activeCategoryCount.count,
      totalCategories: totalCategoryCount.count,
      totalCustomers: customerCount.count,
      lowStock: lowStockCount.count,
      outOfStock: outOfStockCount.count,
      totalOrders: totalOrders.count,
      pendingOrders: pendingOrders.count,
      monthRevenue: monthRevenue.total,
      recentProducts
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

// GET /api/admin/users
// GET /api/admin/users?includeDeleted=true  (Admin only, so soft-deleted
// users can still be seen and restored instead of vanishing forever)
exports.getAllUsers = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';

    const [rows] = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.phone, u.address, u.role,
              u.created_at, u.deleted_at,
              COUNT(o.order_id) AS order_count
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.user_id
       WHERE u.role = 'Customer'
       ${includeDeleted ? '' : 'AND u.deleted_at IS NULL'}
       GROUP BY u.user_id
       ORDER BY u.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// PATCH /api/admin/users/:id/role  (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['Admin', 'Customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role value' });
    }

    // Prevent an admin from demoting/locking themselves out by accident.
    if (Number(id) === req.user.userId) {
      return res.status(400).json({ message: "You can't change your own role" });
    }

    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE user_id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User role updated to ${role}` });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

// DELETE /api/admin/users/:id  (Admin only)
// Soft delete: the row stays in the DB (deleted_at gets a timestamp)
// instead of being physically removed, so past orders still resolve to
// a real user and the account can be recovered if it was a mistake.
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent an admin from deleting their own account out from under themselves.
    if (Number(id) === req.user.userId) {
      return res.status(400).json({ message: "You can't delete your own account" });
    }

    const [result] = await pool.query(
      'UPDATE users SET deleted_at = NOW() WHERE user_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// PATCH /api/admin/users/:id/restore  (Admin only)
exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE users SET deleted_at = NULL WHERE user_id = ? AND deleted_at IS NOT NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or not deleted' });
    }

    res.json({ message: 'User restored successfully' });
  } catch (err) {
    console.error('Restore user error:', err);
    res.status(500).json({ message: 'Server error restoring user' });
  }
};