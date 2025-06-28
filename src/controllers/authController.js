const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
require("dotenv").config();

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Include id, email, name in JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
