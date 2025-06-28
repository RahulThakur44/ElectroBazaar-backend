const db = require('../config/db');
const razorpay = require('../config/razorpay');
const shortid = require('shortid');

// ✅ Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_rcptid_${shortid.generate()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create Razorpay order', error: err });
  }
};

// ✅ Record Payment
exports.createPayment = async (req, res) => {
  try {
    const {
      order_id,
      user_id,
      amount,
      payment_method,
      payment_status = 'Pending',
      transaction_id = null,
      gateway_response = null,
      status_message = null,
    } = req.body;

    const sql = `
      INSERT INTO payments (
        order_id, user_id, amount, payment_method, payment_status,
        transaction_id, gateway_response, status_message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [order_id, user_id, amount, payment_method, payment_status, transaction_id, gateway_response, status_message];
    const [result] = await db.query(sql, values);

    res.status(201).json({ message: 'Payment recorded successfully', paymentId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
};

// ✅ Get All Payments
exports.getAllPayments = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM payments ORDER BY created_at DESC');
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
};

// ✅ Get Payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Payment not found' });

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
};

// ✅ Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    await db.query('UPDATE payments SET payment_status = ? WHERE id = ?', [payment_status, id]);
    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
};

// ✅ Delete Payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM payments WHERE id = ?', [id]);
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
};
