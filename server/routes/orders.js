const express = require("express");
const { pool } = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

const ALLOWED_PAYMENT = new Set(["COD", "UPI"]);

async function getOrderWithItems(connectionOrPool, orderId, userId) {
  const [orders] = await connectionOrPool.query(
    `SELECT id, total_amount, status, payment_method, payment_status,
            shipping_address, phone, created_at
     FROM orders
     WHERE id = ? AND user_id = ?`,
    [orderId, userId]
  );

  if (orders.length === 0) {
    return null;
  }

  const [items] = await connectionOrPool.query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.price,
            p.name, p.image_url,
            (oi.quantity * oi.price) AS line_total
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { order: orders[0], items };
}

// POST /api/orders — place order (COD or mock UPI)
router.post("/", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const shippingAddress = String(req.body.shippingAddress || "").trim();
    const phone = String(req.body.phone || "").trim();
    const paymentMethod = String(req.body.paymentMethod || "COD").toUpperCase();
    const paymentConfirmed = Boolean(req.body.paymentConfirmed);

    if (!shippingAddress || shippingAddress.length < 8) {
      return res.status(400).json({ message: "Please enter a full shipping address" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    if (!ALLOWED_PAYMENT.has(paymentMethod)) {
      return res.status(400).json({ message: "Payment method must be COD or UPI" });
    }

    if (paymentMethod === "UPI" && !paymentConfirmed) {
      return res.status(400).json({
        message: "Complete the UPI payment before placing the order",
      });
    }

    await connection.beginTransaction();

    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?
       FOR UPDATE`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Not enough stock for ${item.name}`,
        });
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const paymentStatus = paymentMethod === "UPI" ? "paid" : "unpaid";
    const orderStatus = paymentMethod === "UPI" ? "confirmed" : "pending";

    const [orderResult] = await connection.query(
      `INSERT INTO orders
        (user_id, total_amount, status, payment_method, payment_status, shipping_address, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        totalAmount,
        orderStatus,
        paymentMethod,
        paymentStatus,
        shippingAddress,
        phone,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }

    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    await connection.commit();

    const details = await getOrderWithItems(pool, orderId, req.user.id);
    const payLabel =
      paymentMethod === "UPI" ? "UPI (Paid)" : "Cash on Delivery";

    res.status(201).json({
      message: `Order placed successfully — ${payLabel}`,
      orderId,
      totalAmount,
      paymentMethod,
      paymentStatus,
      order: details.order,
      items: details.items,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to place order" });
  } finally {
    connection.release();
  }
});

// GET /api/orders — current user's order history
router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.payment_method, o.payment_status,
              o.shipping_address, o.phone, o.created_at,
              COALESCE(SUM(oi.quantity), 0) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id — one order with items
router.get("/:id", async (req, res) => {
  try {
    const details = await getOrderWithItems(pool, req.params.id, req.user.id);

    if (!details) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(details);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

module.exports = router;
