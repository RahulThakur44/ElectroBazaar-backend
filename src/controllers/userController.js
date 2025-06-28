const db = require('../config/db');

// ✅ GET All Users
const getAllUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.status(200).json(results);
  });
};

// ✅ GET User by ID
const getUserById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(results[0]);
  });
};

// ✅ CREATE User (without password)
const createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  });
};

// ✅ UPDATE User
const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.status(200).json({ message: 'User updated successfully' });
  });
};

// ✅ DELETE User
const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.status(200).json({ message: 'User deleted successfully' });
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
