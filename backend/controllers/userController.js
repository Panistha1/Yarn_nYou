const pool = require('../config/db');

// GET /api/users/me  (any logged-in user)
exports.getCurrentUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, name, email, phone, gender, dob, address,
              profile_image, role, created_at
       FROM users WHERE user_id = ?`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// PUT /api/users/me  (any logged-in user — update own profile)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, dob, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    await pool.query(
      `UPDATE users
       SET name = ?, phone = ?, gender = ?, dob = ?, address = ?
       WHERE user_id = ?`,
      [name, phone || null, gender || null, dob || null, address || null, req.user.userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};