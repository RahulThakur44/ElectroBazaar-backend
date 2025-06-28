const db = require('../config/db');
const razorpay = require('../config/razorpay');
const shortid = require('shortid');

// ✅ Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const options = {
      amount: parseInt(amount * 100), // Razorpay expects paisa
      currency: 'INR',
      receipt: `order_rcptid_${shortid.generate()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error });
  }
};

// ✅ Record New Payment
exports.createPayment = (req, res) => {
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

  if (!order_id || !user_id || !amount || !payment_method) {
    return res.status(400).json({ message: 'Missing required payment fields' });
  }

  const sql = `
    INSERT INTO payments (
      order_id, user_id, amount, payment_method, payment_status,
      transaction_id, gateway_response, status_message
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    order_id,
    user_id,
    amount,
    payment_method,
    payment_status,
    transaction_id,
    gateway_response,
    status_message,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Payment Insertion Error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      paymentId: result.insertId,
    });
  });
};

// ✅ Get All Payments
exports.getAllPayments = (req, res) => {
  const sql = `SELECT * FROM payments ORDER BY created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch Payments Error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(200).json(results);
  });
};

// ✅ Get Payment by ID
exports.getPaymentById = (req, res) => {
  const { id } = req.params;

  db.query(`SELECT * FROM payments WHERE id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Payment not found' });

    res.status(200).json(results[0]);
  });
};

// ✅ Update Payment Status
exports.updatePaymentStatus = (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  if (!payment_status) {
    return res.status(400).json({ message: 'Payment status is required' });
  }

  const sql = `UPDATE payments SET payment_status = ? WHERE id = ?`;

  db.query(sql, [payment_status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Payment status updated successfully' });
  });
};

// ✅ Delete Payment
exports.deletePayment = (req, res) => {
  const { id } = req.params;

  db.query(`DELETE FROM payments WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Payment deleted successfully' });
  });
};
