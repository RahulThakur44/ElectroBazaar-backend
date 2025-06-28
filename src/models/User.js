const db = require("../config/db"); // Should be mysql2 with promise support

const User = {
  // ✅ Create a new user
  create: async (data) => {
    const [result] = await db.query("INSERT INTO users SET ?", [data]);
    return result;
  },

  // ✅ Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0]; // Return first matched user
  },
};

module.exports = User;
