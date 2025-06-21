const db = require('../config/db');

// ✅ Create Order
exports.createOrder = (req, res) => {
  const {
    user_id,
    total_amount,
    payment_method,
    address,
    contact,
    products, // [{ product_id, product_name, product_image, qty, price }]
  } = req.body;

  // Validation
  if (
    !user_id ||
    !total_amount ||
    !payment_method ||
    !address ||
    !contact ||
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  // Use the first product's info for quick preview in orders table
  const { product_name, product_image } = products[0];

  const orderSql = `
    INSERT INTO orders (user_id, total_amount, payment_method, status, created_at, address, contact, product_name, product_image)
    VALUES (?, ?, ?, 'Pending', NOW(), ?, ?, ?, ?)
  `;

  db.query(
    orderSql,
    [user_id, total_amount, payment_method, address, contact, product_name, product_image],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error while creating order', error: err });

      const orderId = result.insertId;

      const orderItems = products.map(item => [
        orderId,
        item.product_id,
        item.qty,
        item.price,
      ]);

      const itemsSql = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ?
      `;

      db.query(itemsSql, [orderItems], (err2) => {
        if (err2) return res.status(500).json({ message: 'Failed to insert order items', error: err2 });

        res.status(201).json({
          message: 'Order created successfully',
          orderId,
        });
      });
    }
  );
};

// ✅ Get All Orders
exports.getAllOrders = (req, res) => {
  const sql = `SELECT * FROM orders ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

// ✅ Get Order By ID (with items)
exports.getOrderById = (req, res) => {
  const { id } = req.params;

  const orderSql = `SELECT * FROM orders WHERE id = ?`;
  db.query(orderSql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Order not found' });

    const itemsSql = `SELECT * FROM order_items WHERE order_id = ?`;
    db.query(itemsSql, [id], (err2, items) => {
      if (err2) return res.status(500).json({ message: 'Error fetching order items', error: err2 });

      res.status(200).json({
        order: results[0],
        items,
      });
    });
  });
};

// ✅ Update Order Status
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE orders SET status = ? WHERE id = ?`;
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Order status updated successfully' });
  });
};

// ✅ Delete Order (and its items)
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
