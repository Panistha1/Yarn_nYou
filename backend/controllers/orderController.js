const pool = require('../config/db');
const { initiateKhaltiPayment, lookupKhaltiPayment } = require('../services/khaltiService');

// POST /api/orders  (any logged-in user — checkout)
// body: { shipping_address, payment_method }
// Builds the order from whatever is currently in the user's cart, then
// records the chosen payment method in the separate `payments` table.
exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { shipping_address, payment_method } = req.body;
    const userId = req.user.userId;

    const validPaymentMethods = ['Cash on Delivery', 'eSewa', 'Khalti', 'Card'];
    const chosenPaymentMethod = validPaymentMethods.includes(payment_method)
      ? payment_method
      : 'Cash on Delivery';

    if (!shipping_address) {
      connection.release();
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const [cartRows] = await connection.query(
      'SELECT cart_id FROM carts WHERE user_id = ?',
      [userId]
    );

    if (cartRows.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const cartId = cartRows[0].cart_id;

    const [items] = await connection.query(
      `SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (items.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Make sure nothing in the cart has gone out of stock since it was added
    const outOfStock = items.find((item) => item.quantity > item.stock);
    if (outOfStock) {
      connection.release();
      return res.status(409).json({
        message: `Not enough stock for "${outOfStock.name}" (only ${outOfStock.stock} left)`
      });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address)
       VALUES (?, ?, 'Pending', ?)`,
      [userId, totalAmount, shipping_address]
    );

    const orderId = orderResult.insertId;

    const orderItemRows = items.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.price
    ]);

    await connection.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ?`,
      [orderItemRows]
    );

    // Payment timing rule:
    // - Cash on Delivery: money doesn't actually change hands until the
    //   order is delivered, so payment_status stays 'Pending' until then.
    // - Khalti: the customer is about to be redirected to Khalti's gateway;
    //   it only becomes 'Paid' once verifyKhaltiPayment confirms the
    //   transaction actually completed.
    // - eSewa/Card: no gateway wired up yet, so these still fall back to
    //   the old behaviour of marking 'Paid' immediately at checkout.
    const initialPaymentStatus =
      chosenPaymentMethod === 'Cash on Delivery' || chosenPaymentMethod === 'Khalti'
        ? 'Pending'
        : 'Paid';

    await connection.query(
      `INSERT INTO payments (order_id, payment_method, payment_status, amount)
       VALUES (?, ?, ?, ?)`,
      [orderId, chosenPaymentMethod, initialPaymentStatus, totalAmount]
    );

    // Decrement stock for each purchased product
    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Empty the cart now that it's been turned into an order
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();

    // Order + reserved stock are now committed. For Khalti, kick off the
    // gateway session and hand the client a payment_url to redirect to;
    // the order itself stays 'Pending' until verifyKhaltiPayment confirms
    // the transaction actually went through.
    if (chosenPaymentMethod === 'Khalti') {
      try {
        const [[customer]] = await pool.query(
          'SELECT name, email, phone FROM users WHERE user_id = ?',
          [userId]
        );

        const khaltiData = await initiateKhaltiPayment({
          orderId,
          amountRupees: totalAmount,
          purchaseOrderName: `Order #${orderId} - Yarn N You`,
          returnUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/orders/khalti/verify`,
          websiteUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
          customer: {
            name: customer?.name || 'Customer',
            email: customer?.email || 'customer@example.com',
            phone: customer?.phone || '9800000000'
          }
        });

        await pool.query(
          'UPDATE payments SET transaction_id = ? WHERE order_id = ?',
          [khaltiData.pidx, orderId]
        );

        return res.status(201).json({
          message: 'Order created, redirecting to Khalti',
          orderId,
          totalAmount,
          payment_url: khaltiData.payment_url
        });
      } catch (khaltiErr) {
        console.error('Khalti initiate error:', khaltiErr);

        // Couldn't start the gateway session — don't leave an order sitting
        // there with stock reserved and no way to actually pay for it.
        await pool.query("UPDATE orders SET status = 'Cancelled' WHERE order_id = ?", [orderId]);
        await pool.query("UPDATE payments SET payment_status = 'Failed' WHERE order_id = ?", [orderId]);

        for (const item of items) {
          await pool.query(
            'UPDATE products SET stock = stock + ? WHERE product_id = ?',
            [item.quantity, item.product_id]
          );
        }

        return res.status(502).json({
          message: 'Could not start Khalti payment. Please try again or choose a different payment method.'
        });
      }
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount
    });
  } catch (err) {
    await connection.rollback();
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error placing order' });
  } finally {
    connection.release();
  }
};

// GET /api/orders/khalti/verify  (public — Khalti redirects the customer's
// browser here after they pay or cancel; no Authorization header will be
// present, so this must NOT sit behind verifyToken)
// Per Khalti's docs, the query params on this redirect must not be trusted
// on their own — we always confirm the real status server-to-server via
// the lookup API before touching the database.
exports.verifyKhaltiPayment = async (req, res) => {
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const {
    pidx,
    status,
    transaction_id,
    tidx,
    amount,
    total_amount,
    mobile,
    purchase_order_id: purchaseOrderIdParam,
    purchase_order_name
  } = req.query;

  // Log this callback hit in full, no matter what happens below — this is
  // our permanent record of every query param Khalti actually sent us,
  // good or bad, so admin/user can look back at exactly what came in.
  try {
    await pool.query(
      `INSERT INTO payment_callbacks
        (order_id, provider, pidx, tidx, transaction_id, status, amount, total_amount,
         mobile, purchase_order_id, purchase_order_name, raw_query)
       VALUES (?, 'Khalti', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        purchaseOrderIdParam || null,
        pidx || null,
        tidx || null,
        transaction_id || null,
        status || null,
        amount || null,
        total_amount || null,
        mobile || null,
        purchaseOrderIdParam || null,
        purchase_order_name || null,
        JSON.stringify(req.query)
      ]
    );
  } catch (logErr) {
    // Never let logging failure block the actual payment verification flow.
    console.error('Failed to log Khalti callback:', logErr);
  }

  if (!pidx) {
    return res.redirect(`${frontendBase}/userdashboard?payment=failed`);
  }

  try {
    const result = await lookupKhaltiPayment(pidx);
    const orderId = purchaseOrderIdParam || result?.purchase_order_id;

    if (!orderId) {
      return res.redirect(`${frontendBase}/userdashboard?payment=error`);
    }

    const [[payment]] = await pool.query(
      'SELECT payment_status FROM payments WHERE order_id = ?',
      [orderId]
    );

    // Already resolved earlier (e.g. the browser hit this callback twice) —
    // don't double-restore stock or re-fire status changes, just report
    // whatever the outcome already was.
    if (!payment || payment.payment_status !== 'Pending') {
      const outcome = payment?.payment_status === 'Paid' ? 'success' : 'failed';
      return res.redirect(`${frontendBase}/userdashboard?payment=${outcome}&orderId=${orderId}`);
    }

    if (result.status === 'Completed') {
      await pool.query(
        `UPDATE payments SET payment_status = 'Paid', transaction_id = ?, payment_date = NOW()
         WHERE order_id = ?`,
        [result.transaction_id, orderId]
      );
      await pool.query(
        "UPDATE orders SET status = 'Processing' WHERE order_id = ? AND status = 'Pending'",
        [orderId]
      );

      return res.redirect(`${frontendBase}/userdashboard?payment=success&orderId=${orderId}`);
    }

    // Anything other than 'Completed' (Pending, Initiated, Expired,
    // 'User canceled', Refunded) — treat the order as a lost sale, give the
    // reserved stock back, and let the customer try again.
    await pool.query("UPDATE payments SET payment_status = 'Failed' WHERE order_id = ?", [orderId]);
    await pool.query("UPDATE orders SET status = 'Cancelled' WHERE order_id = ?", [orderId]);

    const [items] = await pool.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );

    for (const item of items) {
      await pool.query(
        'UPDATE products SET stock = stock + ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    return res.redirect(`${frontendBase}/userdashboard?payment=failed&orderId=${orderId}`);
  } catch (err) {
    console.error('Khalti verify error:', err);
    return res.redirect(`${frontendBase}/userdashboard?payment=error`);
  }
};

// GET /api/orders/my  (any logged-in user — their own order history)
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.order_id, o.total_amount, o.status, o.order_date,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.order_date DESC`,
      [req.user.userId]
    );

    res.json(orders);
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ message: 'Server error fetching your orders' });
  }
};

// GET /api/orders/my/:id  (any logged-in user — their own single order)
exports.getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orderRows] = await pool.query(
      `SELECT o.*, pay.payment_method, pay.payment_status
       FROM orders o
       LEFT JOIN payments pay ON pay.order_id = o.order_id
       WHERE o.order_id = ? AND o.user_id = ?`,
      [id, req.user.userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name,
              (SELECT image_url FROM product_images pi
               WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE
               LIMIT 1) AS image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [id]
    );

    // Only relevant for Khalti orders, but harmless (empty array) otherwise —
    // lets the customer see exactly what the gateway reported back to us.
    const [paymentCallbacks] = await pool.query(
      `SELECT callback_id, provider, status, transaction_id, tidx, amount,
              total_amount, mobile, received_at
       FROM payment_callbacks
       WHERE order_id = ?
       ORDER BY received_at ASC`,
      [id]
    );

    res.json({ order: orderRows[0], items, payment_callbacks: paymentCallbacks });
  } catch (err) {
    console.error('Get my order error:', err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// GET /api/orders  (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.order_id, o.total_amount, o.status, o.order_date,
              u.name AS customer_name, u.email AS customer_email,
              pay.payment_method, pay.payment_status,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       LEFT JOIN payments pay ON pay.order_id = o.order_id
       ORDER BY o.order_date DESC`
    );

    const [[totalOrders]] = await pool.query('SELECT COUNT(*) AS count FROM orders');

    const [[pendingOrders]] = await pool.query(
      "SELECT COUNT(*) AS count FROM orders WHERE status IN ('Pending', 'Processing')"
    );

    const [[completedOrders]] = await pool.query(
      "SELECT COUNT(*) AS count FROM orders WHERE status = 'Delivered'"
    );

    // Revenue = money actually confirmed paid, not just orders placed.
    // Cash on Delivery isn't 'Paid' until updateOrderStatus marks it so on
    // delivery; other methods are marked 'Paid' immediately at checkout.
    // Bucketed by payment_date (when it was actually paid) rather than
    // order_date, so a COD order placed one month but paid the next
    // counts toward the month it was actually collected in.
    const [[monthRevenue]] = await pool.query(
      `SELECT COALESCE(SUM(o.total_amount), 0) AS total
       FROM orders o
       JOIN payments p ON p.order_id = o.order_id
       WHERE p.payment_status = 'Paid'
       AND MONTH(p.payment_date) = MONTH(CURRENT_DATE())
       AND YEAR(p.payment_date) = YEAR(CURRENT_DATE())`
    );

    res.json({
      orders,
      stats: {
        totalOrders: totalOrders.count,
        pendingOrders: pendingOrders.count,
        completedOrders: completedOrders.count,
        monthRevenue: monthRevenue.total
      }
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// GET /api/orders/:id  (Admin only)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orderRows] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email,
              u.phone AS customer_phone, u.created_at AS customer_since,
              pay.payment_method, pay.payment_status, pay.transaction_id
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       LEFT JOIN payments pay ON pay.order_id = o.order_id
       WHERE o.order_id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.sku, p.description AS product_description,
              (SELECT image_url FROM product_images pi
               WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE
               LIMIT 1) AS image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [id]
    );

    // Admin gets the full raw_query payload too, not just the parsed
    // fields — useful for debugging a payment that looks off.
    const [paymentCallbacks] = await pool.query(
      `SELECT callback_id, provider, pidx, tidx, transaction_id, status, amount,
              total_amount, mobile, purchase_order_name, raw_query, received_at
       FROM payment_callbacks
       WHERE order_id = ?
       ORDER BY received_at ASC`,
      [id]
    );

    res.json({
      order: orderRows[0],
      items,
      payment_callbacks: paymentCallbacks
    });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// PATCH /api/orders/:id/status  (Admin only)
exports.updateOrderStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      connection.release();
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [existingRows] = await connection.query(
      `SELECT o.status, p.payment_method, p.payment_status
       FROM orders o
       JOIN payments p ON p.order_id = o.order_id
       WHERE o.order_id = ?`,
      [id]
    );

    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = existingRows[0].status;
    const { payment_method, payment_status } = existingRows[0];

    await connection.beginTransaction();

    await connection.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, id]
    );

    // Payment timing rule (mirrors createOrder):
    // - Cash on Delivery only actually gets paid once the order is
    //   delivered — that's the moment cash changes hands — so flip it
    //   to 'Paid' here instead of at checkout.
    if (status === 'Delivered' && payment_method === 'Cash on Delivery' && payment_status !== 'Paid') {
      await connection.query(
        `UPDATE payments SET payment_status = 'Paid', payment_date = NOW() WHERE order_id = ?`,
        [id]
      );
    }

    // If an order that was already paid gets cancelled, that money is
    // now owed back to the customer — mark it Refunded so it stops
    // counting as revenue instead of silently staying 'Paid' forever.
    if (status === 'Cancelled' && previousStatus !== 'Cancelled' && payment_status === 'Paid') {
      await connection.query(
        `UPDATE payments SET payment_status = 'Refunded' WHERE order_id = ?`,
        [id]
      );
    }

    // If the order is being cancelled (and wasn't already), give the
    // stock that was reserved at checkout back to each product so it
    // isn't lost forever.
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    await connection.commit();

    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Server error updating order status' });
  } finally {
    connection.release();
  }
};