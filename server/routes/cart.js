const express = require("express");
const { pool } = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// All cart routes need login — cart is saved in MySQL per user
router.use(authenticate);

async function getCartForUser(userId) {
  const [items] = await pool.query(
    `SELECT c.id, c.quantity, c.product_id,
            p.name, p.price, p.image_url, p.stock,
            (c.quantity * p.price) AS line_total
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = ?
     ORDER BY c.id DESC`,
    [userId]
  );

  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  return { items, total, itemCount };
}

// GET /api/cart
router.get("/", async (req, res) => {
  try {
    const cart = await getCartForUser(req.user.id);
    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// GET /api/cart/count — lightweight count for navbar
router.get("/count", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COALESCE(SUM(quantity), 0) AS itemCount FROM cart_items WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ itemCount: Number(rows[0].itemCount) });
  } catch (error) {
    console.error("Get cart count error:", error);
    res.status(500).json({ message: "Failed to fetch cart count" });
  }
});

// POST /api/cart  { productId, quantity }
router.post("/", async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity || 1);

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: "Valid productId and quantity required" });
    }

    const [products] = await pool.query("SELECT id, stock, name FROM products WHERE id = ?", [
      productId,
    ]);
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = products[0];

    const [existing] = await pool.query(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId]
    );

    const currentQty = existing.length > 0 ? Number(existing[0].quantity) : 0;
    const nextQty = currentQty + quantity;

    if (nextQty > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} left in stock for ${product.name}`,
      });
    }

    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, productId, quantity]
    );

    const cart = await getCartForUser(req.user.id);
    res.status(201).json({ message: "Added to cart", ...cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// PUT /api/cart/:id  { quantity }
router.put("/:id", async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const [rows] = await pool.query(
      `SELECT c.id, p.stock, p.name
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity > rows[0].stock) {
      return res.status(400).json({
        message: `Only ${rows[0].stock} left in stock for ${rows[0].name}`,
      });
    }

    await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?", [
      quantity,
      req.params.id,
      req.user.id,
    ]);

    const cart = await getCartForUser(req.user.id);
    res.json({ message: "Cart updated", ...cart });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// DELETE /api/cart/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const cart = await getCartForUser(req.user.id);
    res.json({ message: "Item removed from cart", ...cart });
  } catch (error) {
    console.error("Delete cart error:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

module.exports = router;
