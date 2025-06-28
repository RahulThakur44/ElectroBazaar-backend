const db = require('../config/db');

// ✅ Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      user_id,
      total_amount,
      payment_method,
      address,
      contact,
      products,
    } = req.body;

    if (
      !user_id || !total_amount || !payment_method ||
      !address || !contact || !Array.isArray(products) || products.length === 0
    ) {
      return res.status(400).json({ message: 'Missing order details' });
    }

    const [orderResult] = await db.query(`
      INSERT INTO orders (user_id, total_amount, payment_method, status, created_at, address, contact)
      VALUES (?, ?, ?, 'Pending', NOW(), ?, ?)
    `, [user_id, total_amount, payment_method, address, contact]);

    const orderId = orderResult.insertId;

    const orderItems = products.map(item => [
      orderId,
      item.product_id,
      item.qty,
      item.price
    ]);

    await db.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`, [orderItems]);

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (err) {
    console.error('❌ Error creating order:', err);
    res.status(500).json({ message: 'Error creating order', error: err });
  }
};

// ✅ Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        o.id AS order_id,
        o.user_id,
        o.total_amount,
        o.payment_method,
        o.status,
        o.created_at,
        o.address,
        o.contact,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image AS product_image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON p.id = oi.product_id
      ORDER BY o.created_at DESC
    `);

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

      if (row.product_id) {
        grouped[orderId].products.push({
          product_id: row.product_id,
          quantity: row.quantity,
          price: row.price,
          product_name: row.product_name || 'N/A',
          product_image: row.product_image || '',
        });
      }
    });

    res.status(200).json(Object.values(grouped));
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
};

// ✅ Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [orderResults] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);

    if (orderResults.length === 0)
      return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(`
      SELECT 
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    res.status(200).json({
      order: orderResults[0],
      products: items,
    });
  } catch (err) {
    console.error('❌ Error fetching order by ID:', err);
    res.status(500).json({ message: 'Error fetching order', error: err });
  }
};

// ✅ Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error('❌ Error updating order status:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
};

// ✅ Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM order_items WHERE order_id = ?`, [id]);
    await db.query(`DELETE FROM orders WHERE id = ?`, [id]);

    res.status(200).json({ message: 'Order and items deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting order:', err);
    res.status(500).json({ message: 'Error deleting order', error: err });
  }
};
