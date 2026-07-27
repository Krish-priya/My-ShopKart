const express = require("express");
const { pool } = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { getRazorpayClient } = require("../utils/razorpay");

const router = express.Router();

router.use(authenticate);

// POST /api/payments/razorpay/create — create Razorpay order for current cart total
router.post("/razorpay/create", async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        message: "Razorpay TEST keys are not configured on the server",
      });
    }

    const [cartItems] = await pool.query(
      `SELECT c.quantity, p.price, p.stock, p.name
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.name}` });
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    // Razorpay expects amount in paise
    const amountPaise = Math.round(totalAmount * 100);
    if (amountPaise < 100) {
      return res.status(400).json({ message: "Order amount is too low for online payment" });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `sk_${req.user.id}_${Date.now()}`,
      notes: {
        userId: String(req.user.id),
        mode: "TEST",
      },
    });

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: order.id,
      totalAmount,
      mode: "TEST",
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    res.status(500).json({
      message: error?.error?.description || error.message || "Failed to start Razorpay payment",
    });
  }
});

module.exports = router;
