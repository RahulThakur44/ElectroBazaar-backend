const db = require('../config/db');

// ✅ Create New Order with Items (COD or Razorpay)
exports.createOrder = (req, res) => {
  console.log("📦 Order Request Body:", req.body);

  const {
    user_id,
    total_amount,
    payment_method,
    address,
    contact,
    products, // expected: [{ product_id, qty, price }]
  } = req.body;

  // ❌ Validate required fields
  if (
    !user_id || !total_amount || !payment_method ||
    !address || !contact || !Array.isArray(products) || products.length === 0
  ) {
    console.log("❌ Missing order details");
    return res.status(400).json({ message: 'Missing order details' });
  }

  // ❌ Validate product structure
  const invalidProduct = products.find(p => !p.product_id || !p.qty || !p.price);
  if (invalidProduct) {
    console.log("❌ Invalid product in order:", invalidProduct);
    return res.status(400).json({ message: 'Invalid product structure' });
  }

  // ✅ Insert into orders table
  const orderSql = `
    INSERT INTO orders (user_id, total_amount, payment_method, status, created_at, address, contact)
    VALUES (?, ?, ?, 'Pending', NOW(), ?, ?)
  `;

  db.query(orderSql, [user_id, total_amount, payment_method, address, contact], (err, result) => {
    if (err) {
      console.error("❌ Error inserting order:", err);
      return res.status(500).json({ message: 'Error creating order', error: err });
    }

    const orderId = result.insertId;

    const orderItems = products.map(item => [
      orderId,
      item.product_id,
      item.qty,
      item.price
    ]);

    const itemsSql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;

    db.query(itemsSql, [orderItems], (err2) => {
      if (err2) {
        console.error("❌ Error inserting order items:", err2);
        return res.status(500).json({ message: 'Failed to insert order items', error: err2 });
      }

      console.log("✅ Order placed successfully with ID:", orderId);
      return res.status(201).json({ message: 'Order created successfully', orderId });
    });
  });
};

// ✅ Get All Orders with Product Summary
exports.getAllOrders = (req, res) => {
  const sql = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.total_amount,
      o.payment_method,
      o.status,
      o.created_at,
      o.address,
      o.contact,
      p.name AS product_name,
      p.image AS product_image
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON p.id = oi.product_id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    const grouped = {};
    results.forEach(row => {
      const orderId = row.order_id;
      if (!grouped[orderId]) {
        grouped[orderId] = {
          id: orderId,
          user_id: row.user_id,
          total_amount: parseFloat(row.total_amount),
          payment_method: row.payment_method,
          status: row.status,
          created_at: row.created_at,
          address: row.address,
          contact: row.contact,
          products: [],
        };
      }

      if (row.product_name && row.product_image) {
        grouped[orderId].products.push({
          product_name: row.product_name,
          product_image: row.product_image,
        });
      }
    });

    res.status(200).json(Object.values(grouped));
  });
};

// ✅ Get Single Order by ID with Items
exports.getOrderById = (req, res) => {
  const { id } = req.params;

  const orderSql = `SELECT * FROM orders WHERE id = ?`;
  db.query(orderSql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Order not found' });

    const itemsSql = `
      SELECT 
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;

    db.query(itemsSql, [id], (err2, items) => {
      if (err2) return res.status(500).json({ message: 'Error fetching order items', error: err2 });

      res.status(200).json({
        order: results[0],
        products: items,
      });
    });
  });
};

// ✅ Update Order Status
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const sql = `UPDATE orders SET status = ? WHERE id = ?`;
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Order status updated successfully' });
  });
};

// ✅ Delete Order and Items
exports.deleteOrder = (req, res) => {
  const { id } = req.params;

  const deleteItemsSql = `DELETE FROM order_items WHERE order_id = ?`;
  db.query(deleteItemsSql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting order items', error: err });

    const deleteOrderSql = `DELETE FROM orders WHERE id = ?`;
    db.query(deleteOrderSql, [id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Error deleting order', error: err2 });

      res.status(200).json({ message: 'Order and items deleted successfully' });
    });
  });
};
