const db = require("../config/db");

const User = {
  create: (data) => {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO users SET ?", data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }
};

module.exports = User;
