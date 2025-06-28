const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ Get all addresses by user_id
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [user_id]
    );
    res.status(200).json({ addresses: rows });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// ✅ Add new address
router.post('/', async (req, res) => {
  const { user_id, name, contact, address, area, is_default } = req.body;
  if (!user_id || !name || !contact || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (is_default) {
      // Reset existing default
      await db.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [user_id]);
    }

    await db.query(
      'INSERT INTO user_addresses (user_id, name, contact, address, area, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, name, contact, address, area, !!is_default]
    );

    res.status(201).json({ message: 'Address added' });
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// ✅ Update address
router.put('/:id', async (req, res) => {
  const { name, contact, address, area, is_default } = req.body;
  const { id } = req.params;

  try {
    if (is_default) {
      const [[row]] = await db.query('SELECT user_id FROM user_addresses WHERE id = ?', [id]);
      if (row?.user_id) {
        await db.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [row.user_id]);
      }
    }

    await db.query(
      'UPDATE user_addresses SET name = ?, contact = ?, address = ?, area = ?, is_default = ? WHERE id = ?',
      [name, contact, address, area, !!is_default, id]
    );

    res.status(200).json({ message: 'Address updated' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// ✅ Delete address
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM user_addresses WHERE id = ?', [id]);
    res.status(200).json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;
