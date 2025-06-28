const db = require('../config/db');

// ✅ Dashboard Stats (Async/Await version)
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ totalSales }]] = await db.query('SELECT SUM(amount) AS totalSales FROM payments WHERE payment_status = "Success"');
    const [[{ totalPayments }]] = await db.query('SELECT COUNT(*) AS totalPayments FROM payments');

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalSales: totalSales || 0,
      totalPayments,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Dashboard Stats Error', error: err.message });
  }
};

// ✅ Sales Chart (Last 7 Days)
exports.getSalesByDate = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT DATE(created_at) AS date, SUM(amount) AS total
      FROM payments
      WHERE payment_status = "Success"
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 7
    `);
    res.status(200).json(result);
  } catch (err) {
    console.error('Sales Chart Error:', err);
    res.status(500).json({ message: 'Sales Chart Error', error: err.message });
  }
};
