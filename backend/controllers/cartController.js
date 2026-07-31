const pool = require('../config/db');

// Helper: get or create the current user's cart row, return cart_id
async function getOrCreateCartId(userId) {

  const [existing] = await pool.query(
    'SELECT cart_id FROM carts WHERE user_id = ?',
    [userId]
  );

  if (existing.length > 0) {
    return existing[0].cart_id;
  }

  const [result] = await pool.query(
    'INSERT INTO carts (user_id) VALUES (?)',
    [userId]
  );

  return result.insertId;
}

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.userId);

    const [items] = await pool.query(
      `SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.stock,
              (SELECT image_url FROM product_images pi
               WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE
               LIMIT 1) AS image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    res.json({ items, subtotal });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// POST /api/cart   body: { product_id, quantity }
exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    const [productRows] = await pool.query(
      'SELECT stock, deleted_at FROM products WHERE product_id = ?',
      [product_id]
    );

    if (productRows.length === 0 || productRows[0].deleted_at) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cartId = await getOrCreateCartId(req.user.userId);

    // Check how much of this product is already in the cart so the
    // combined quantity (existing + newly requested) never exceeds stock.
    const [existingItemRows] = await pool.query(
      'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, product_id]
    );
    const alreadyInCart = existingItemRows.length > 0 ? existingItemRows[0].quantity : 0;

    if (alreadyInCart + qty > productRows[0].stock) {
      return res.status(409).json({
        message: `Only ${productRows[0].stock} in stock (you already have ${alreadyInCart} in your cart)`
      });
    }

    // ON DUPLICATE KEY relies on the UNIQUE(cart_id, product_id) constraint
    // on cart_items — bumps quantity instead of creating a duplicate row.
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [cartId, product_id, qty, qty]
    );

    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// PUT /api/cart/:itemId   body: { quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Make sure the requested quantity doesn't exceed the product's stock.
    const [stockRows] = await pool.query(
      `SELECT p.stock FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.cart_id
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_item_id = ? AND c.user_id = ?`,
      [itemId, req.user.userId]
    );

    if (stockRows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity > stockRows[0].stock) {
      return res.status(409).json({
        message: `Only ${stockRows[0].stock} in stock`
      });
    }

    const [result] = await pool.query(
      `UPDATE cart_items ci
       JOIN carts c ON ci.cart_id = c.cart_id
       SET ci.quantity = ?
       WHERE ci.cart_item_id = ? AND c.user_id = ?`,
      [quantity, itemId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Update cart item error:', err);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

// DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const [result] = await pool.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.cart_id
       WHERE ci.cart_item_id = ? AND c.user_id = ?`,
      [itemId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove cart item error:', err);
    res.status(500).json({ message: 'Server error removing item' });
  }
};

module.exports.getOrCreateCartId = getOrCreateCartId;