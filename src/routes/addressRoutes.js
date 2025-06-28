const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ GET address by user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [user_id]
    );
    if (rows.length === 0) {
      return res.status(200).json({ address: null });
    }
    res.status(200).json({ address: rows[0] });
  } catch (error) {
    console.error('Address fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ SAVE or UPDATE address by user_id
router.post('/', async (req, res) => {
  const { user_id, name, contact, address, area } = req.body;

  if (!user_id || !name || !contact || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if address exists
    const [existing] = await db.query(
      'SELECT * FROM user_addresses WHERE user_id = ?',
      [user_id]
    );

    if (existing.length > 0) {
      // ✅ Update existing address
      await db.query(
        'UPDATE user_addresses SET name = ?, contact = ?, address = ?, area = ? WHERE user_id = ?',
        [name, contact, address, area, user_id]
      );
      return res.status(200).json({ success: true, message: 'Address updated' });
    } else {
      // ✅ Insert new address
      await db.query(
        'INSERT INTO user_addresses (user_id, name, contact, address, area) VALUES (?, ?, ?, ?, ?)',
        [user_id, name, contact, address, area]
      );
      return res.status(201).json({ success: true, message: 'Address saved' });
    }
  } catch (error) {
    console.error('Address save/update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
