require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const wishlistRoutes = require("./routes/wishlist");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the React app (different port) to call this API
app.use(cors());
// Parse JSON bodies from requests
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "ShopKart API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

async function startServer() {
  try {
    await testConnection();
    const server = app.listen(PORT, () => {
      console.log(`ShopKart server running on http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the other server process, then restart.`
        );
      } else {
        console.error("Server failed to start:", error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server. Check MySQL credentials in .env");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
