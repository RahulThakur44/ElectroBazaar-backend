const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productRoutes = require("./routes/productRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const paymentRoutes = require("./routes/payment");
const protectedRoute = require("./routes/protectedRoute");
const authRoutes = require("./routes/authRoutes");
const verifyToken = require("./middleware/verifyToken");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const path = require('path');


dotenv.config();


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname,'uploads')));


// Authentication Routes
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/categories', categoryRoutes);

// Protected Route (Requires JWT token)
app.get("/profile", verifyToken, (req, res) => {
  // Access protected data after verifying token
  res.json({ success: true, message: "Welcome to your profile!", user: req.user });
});  

// Other Routes
app.use("/api/products", productRoutes);
app.use("/", paymentRoutes);
app.use("/api", protectedRoute);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
