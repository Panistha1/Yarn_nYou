require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    const [rows] = await pool.query('SELECT COUNT(*) AS category_count FROM categories');
    res.json({
      status: 'ok',
      database: 'connected',
      categories_in_db: rows[0].category_count
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'failed',
      error: err.message
    });
  }
});
// ────────────────────────────────────────────────────────────────────────────

// Serve uploaded product images statically, e.g. /uploads/products/abc.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route groups
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => {
  res.send('Yarn N You API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});