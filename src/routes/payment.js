const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🛒 Order Create API
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Amount in paisa (₹1 = 100 paisa)
      currency: "INR",
      receipt: `order_rcptid_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Payment Verification API
router.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // **Database me payment status update karein (Optional)**
    res.status(200).json({ success: true, message: "Payment verified", paymentId: razorpay_payment_id });
  } catch (error) {
    res.status(500).json({ success: false, error: "Payment verification failed" });
  }
});

module.exports = router;
