const db = require('../config/db');

// ✅ Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users ORDER BY id DESC');
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
};

// ✅ Get User by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Fetch user by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error });
  }
};

// ✅ Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;

  try {
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?',
      [name, email, role, status, id]
    );
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user', error });
  }
};

// ✅ Delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error });
  }
};
