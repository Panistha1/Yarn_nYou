const pool = require('../config/db');

// GET /api/settings  (Admin only)
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM store_settings WHERE setting_id = 1'
    );

    // If the table exists but has no row yet, create the default one on the
    // fly so the settings page never shows an error on a fresh install.
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO store_settings (setting_id, shop_name, store_email, currency, language)
         VALUES (1, 'Yarn N You', 'admin@yarnnyou.com', 'NPR', 'English (United States)')`
      );

      const [newRows] = await pool.query(
        'SELECT * FROM store_settings WHERE setting_id = 1'
      );

      return res.json(newRows[0]);
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get settings error:', err);

    // Give the frontend a useful message if the table hasn't been created yet
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({
        message: 'store_settings table not found. Please run backend/schema_patch.sql against your database.'
      });
    }

    res.status(500).json({ message: 'Server error fetching settings' });
  }
};

// PUT /api/settings  (Admin only)
exports.updateSettings = async (req, res) => {
  try {
    const { shop_name, store_email, currency, language } = req.body;

    if (!shop_name || !store_email) {
      return res.status(400).json({ message: 'Shop name and store email are required' });
    }

    await pool.query(
      `UPDATE store_settings
       SET shop_name = ?, store_email = ?, currency = ?, language = ?
       WHERE setting_id = 1`,
      [shop_name, store_email, currency || 'NPR', language || 'English (United States)']
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};