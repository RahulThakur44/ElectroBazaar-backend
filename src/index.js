const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/payment");
const protectedRoute = require("./routes/protectedRoute");
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analytics');
const addressRoutes = require('./routes/addressRoutes');

// Middleware
const verifyToken = require("./middleware/verifyToken");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// ❌ REMOVE local uploads folder static serve
 //app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public Routes
app.use("/api", authRoutes);                // Login/Register
app.use("/api/users", userRoutes);          // User CRUD
app.use("/api/categories", categoryRoutes); // Categories
app.use("/api/products", productRoutes);    // Products
app.use("/api/payments", paymentRoutes);    // Payment
app.use("/api/orders", orderRoutes);        // Orders
app.use("/api/analytics", analyticsRoutes); // Analytics
app.use("/api/address", addressRoutes);

// Protected route example
app.get("/api/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to your profile!",
    user: req.user,
  });
});

// Optional protected test route
app.use("/api/protected", protectedRoute);

// Global error handler
app.use(errorHandler);

// Test home route
app.get("/", (req, res) => {
  res.send("ElectroBazaar Backend is live!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
