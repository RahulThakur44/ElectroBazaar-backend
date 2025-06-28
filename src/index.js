const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Optional: log requests for debugging (only in dev)
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Routes
app.use("/api", require("./routes/authRoutes"));               // Auth (Login/Register)
app.use("/api/users", require("./routes/userRoutes"));         // User CRUD
app.use("/api/categories", require("./routes/categoryRoutes"));// Categories
app.use("/api/products", require("./routes/productRoutes"));   // Products
app.use("/api/payments", require("./routes/payment"));         // Payments
app.use("/api/orders", require("./routes/orderRoutes"));       // Orders
app.use("/api/analytics", require("./routes/analytics"));      // Analytics
app.use("/api/address", require("./routes/addressRoutes"));    // Shipping Addresses

// ✅ Protected route test (with JWT middleware)
const verifyToken = require("./middleware/verifyToken");
app.get("/api/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to your profile!",
    user: req.user,
  });
});

// Optional extra protected route
app.use("/api/protected", require("./routes/protectedRoute"));

// ✅ Global error handler
app.use(require("./middleware/errorMiddleware"));

// Root route
app.get("/", (req, res) => {
  res.send("✅ ElectroBazaar Backend is Live!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
