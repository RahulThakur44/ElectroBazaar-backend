const db = require('../config/db');

// ✅ Get Dashboard Stats
exports.getDashboardStats = (req, res) => {
  const stats = {};

  const userQuery = 'SELECT COUNT(*) AS totalUsers FROM users';
  const orderQuery = 'SELECT COUNT(*) AS totalOrders FROM orders';
  const productQuery = 'SELECT COUNT(*) AS totalProducts FROM products';
  const salesQuery = 'SELECT SUM(amount) AS totalSales FROM payments WHERE payment_status = "Success"';
  const paymentCountQuery = 'SELECT COUNT(*) AS totalPayments FROM payments';

  db.query(userQuery, (err, userResult) => {
    if (err) return res.status(500).json({ message: 'User Count Error', err });
    stats.totalUsers = userResult[0].totalUsers;

    db.query(orderQuery, (err, orderResult) => {
      if (err) return res.status(500).json({ message: 'Order Count Error', err });
      stats.totalOrders = orderResult[0].totalOrders;

      db.query(productQuery, (err, productResult) => {
        if (err) return res.status(500).json({ message: 'Product Count Error', err });
        stats.totalProducts = productResult[0].totalProducts;

        db.query(salesQuery, (err, salesResult) => {
          if (err) return res.status(500).json({ message: 'Sales Fetch Error', err });
          stats.totalSales = salesResult[0].totalSales || 0;

          db.query(paymentCountQuery, (err, paymentCountResult) => {
            if (err) return res.status(500).json({ message: 'Payment Count Error', err });
            stats.totalPayments = paymentCountResult[0].totalPayments;

            // ✅ Send final response
            res.status(200).json(stats);
          });
        });
      });
    });
  });
};

// ✅ Sales Chart Data (Last 7 Days)
exports.getSalesByDate = (req, res) => {
  const sql = `
    SELECT DATE(created_at) AS date, SUM(amount) AS total
    FROM payments
    WHERE payment_status = "Success"
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) DESC
    LIMIT 7
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'Sales Chart Error', err });
    res.status(200).json(result);
  });
};
