const db = require('../config/db');

// Get address by user ID
const getAddressByUserId = async (userId) => {
  const [rows] = await db.query('SELECT * FROM addresses WHERE user_id = ?', [userId]);
  return rows[0]; // Return only the first match (1 address per user)
};

// Save or Update address
const saveOrUpdateAddress = async (data) => {
  const { user_id, name, contact, address, area } = data;

  // Check if address already exists
  const [existing] = await db.query('SELECT * FROM addresses WHERE user_id = ?', [user_id]);

  if (existing.length > 0) {
    await db.query(
      'UPDATE addresses SET name = ?, contact = ?, address = ?, area = ? WHERE user_id = ?',
      [name, contact, address, area, user_id]
    );
  } else {
    await db.query(
      'INSERT INTO addresses (user_id, name, contact, address, area) VALUES (?, ?, ?, ?, ?)',
      [user_id, name, contact, address, area]
    );
  }
};

module.exports = {
  getAddressByUserId,
  saveOrUpdateAddress
};
