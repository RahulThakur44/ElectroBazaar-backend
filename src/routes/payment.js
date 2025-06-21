const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Razorpay order creation
router.post('/create-order', paymentController.createRazorpayOrder);

// Payments CRUD
router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id/status', paymentController.updatePaymentStatus);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
