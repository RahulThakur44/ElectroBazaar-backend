// src/controllers/orderController.js
const db = require('../config/db');

// ✅ Create New Order
exports.createOrder = async (req, res) => {
  try {
    const { user_id, total_amount, payment_method, address, contact, products } = req.body;

    if (!user_id || !total_amount || !payment_method || !address || !contact || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Missing order details' });
    }

    const [result] = await db.query(`
      INSERT INTO orders (user_id, total_amount, payment_method, status, created_at, address, contact)
      VALUES (?, ?, ?, 'Pending', NOW(), ?, ?)
    `, [user_id, total_amount, payment_method, address, contact]);

    const orderId = result.insertId;

    const orderItems = products.map(item => [
      orderId,
      item.product_id,
      item.qty,
      item.price
    ]);

    await db.query(`
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ?
    `, [orderItems]);

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// ✅ Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.id AS order_id, o.user_id, o.total_amount, o.payment_method, o.status, o.created_at,
             o.address, o.contact,
             p.name AS product_name, p.image AS product_image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON p.id = oi.product_id
      ORDER BY o.created_at DESC
    `);

    const grouped = {};

    for (const row of rows) {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          id: row.order_id,
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
        grouped[row.order_id].products.push({
          product_name: row.product_name,
          product_image: row.product_image,
        });
      }
    }

    res.status(200).json(Object.values(grouped));
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// ✅ Get Single Order by ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const [orderData] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (orderData.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(`
      SELECT oi.quantity, oi.price,
             p.name AS product_name, p.image AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    res.status(200).json({ order: orderData[0], products: items });
  } catch (err) {
    console.error('Get Order Error:', err);
    res.status(500).json({ message: 'Failed to get order', error: err.message });
  }
};

// ✅ Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    res.status(200).json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

// ✅ Delete Order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM order_items WHERE order_id = ?`, [id]);
    await db.query(`DELETE FROM orders WHERE id = ?`, [id]);
    res.status(200).json({ message: 'Order and items deleted' });
  } catch (err) {
    console.error('Delete Order Error:', err);
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
};
