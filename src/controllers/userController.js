const db = require('../config/db');

// ✅ GET All Users
const getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// ✅ GET User by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// ✅ CREATE User (without password)
const createUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const [result] = await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// ✅ UPDATE User
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// ✅ DELETE User
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
