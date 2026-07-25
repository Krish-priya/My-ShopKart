const express = require("express");
const { pool } = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

async function getWishlistForUser(userId) {
  const [items] = await pool.query(
    `SELECT w.id, w.product_id, w.created_at,
            p.name, p.price, p.image_url, p.category, p.stock, p.description
     FROM wishlist w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId]
  );

  return { items, count: items.length };
}

// GET /api/wishlist
router.get("/", async (req, res) => {
  try {
    const data = await getWishlistForUser(req.user.id);
    res.json(data);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

// GET /api/wishlist/ids — product ids for heart toggles
router.get("/ids", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT product_id FROM wishlist WHERE user_id = ?",
      [req.user.id]
    );
    res.json({
      productIds: rows.map((row) => row.product_id),
      count: rows.length,
    });
  } catch (error) {
    console.error("Get wishlist ids error:", error);
    res.status(500).json({ message: "Failed to fetch wishlist ids" });
  }
});

// POST /api/wishlist  { productId }
router.post("/", async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    if (!productId) {
      return res.status(400).json({ message: "Valid productId required" });
    }

    const [products] = await pool.query("SELECT id FROM products WHERE id = ?", [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await pool.query(
      "INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [req.user.id, productId]
    );

    const data = await getWishlistForUser(req.user.id);
    res.status(201).json({ message: "Added to wishlist", ...data });
  } catch (error) {
    console.error("Add wishlist error:", error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

// DELETE /api/wishlist/:productId
router.delete("/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!productId) {
      return res.status(400).json({ message: "Valid productId required" });
    }

    await pool.query("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [
      req.user.id,
      productId,
    ]);

    const data = await getWishlistForUser(req.user.id);
    res.json({ message: "Removed from wishlist", ...data });
  } catch (error) {
    console.error("Remove wishlist error:", error);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

// POST /api/wishlist/:productId/move-to-cart
router.post("/:productId/move-to-cart", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const productId = Number(req.params.productId);
    if (!productId) {
      return res.status(400).json({ message: "Valid productId required" });
    }

    await connection.beginTransaction();

    const [wishRows] = await connection.query(
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId]
    );

    if (wishRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Item not in wishlist" });
    }

    const [products] = await connection.query(
      "SELECT id, stock, name FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    const product = products[0];
    if (product.stock < 1) {
      await connection.rollback();
      return res.status(400).json({ message: `${product.name} is out of stock` });
    }

    const [existing] = await connection.query(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      const nextQty = Number(existing[0].quantity) + 1;
      if (nextQty > product.stock) {
        await connection.rollback();
        return res.status(400).json({ message: "Not enough stock available" });
      }
      await connection.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        nextQty,
        existing[0].id,
      ]);
    } else {
      await connection.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)",
        [req.user.id, productId]
      );
    }

    await connection.query("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [
      req.user.id,
      productId,
    ]);

    await connection.commit();

    const data = await getWishlistForUser(req.user.id);
    res.json({ message: "Moved to cart", ...data });
  } catch (error) {
    await connection.rollback();
    console.error("Move to cart error:", error);
    res.status(500).json({ message: "Failed to move item to cart" });
  } finally {
    connection.release();
  }
});

module.exports = router;
