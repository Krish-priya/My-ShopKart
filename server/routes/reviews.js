const express = require("express");
const { pool } = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { reviewRules } = require("../middleware/validators");

const router = express.Router();

async function getReviewSummary(productId) {
  const [[stats]] = await pool.query(
    `SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS review_count
     FROM reviews WHERE product_id = ?`,
    [productId]
  );
  return {
    avg_rating: Number(Number(stats.avg_rating).toFixed(1)),
    review_count: Number(stats.review_count),
  };
}

// GET /api/reviews/product/:productId
router.get("/product/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!productId) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const summary = await getReviewSummary(productId);
    res.json({ reviews, ...summary });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
});

// GET /api/reviews/product/:productId/eligibility — can current user review?
router.get("/product/:productId/eligibility", authenticate, async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const [[purchased]] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'cancelled'`,
      [req.user.id, productId]
    );

    const [existing] = await pool.query(
      "SELECT id FROM reviews WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId]
    );

    res.json({
      canReview: purchased.count > 0 && existing.length === 0,
      hasPurchased: purchased.count > 0,
      alreadyReviewed: existing.length > 0,
    });
  } catch (error) {
    console.error("Review eligibility error:", error);
    res.status(500).json({ message: "Failed to check review eligibility" });
  }
});

// POST /api/reviews/product/:productId
router.post("/product/:productId", authenticate, reviewRules, validate, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    const [products] = await pool.query("SELECT id FROM products WHERE id = ?", [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [[purchased]] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'cancelled'`,
      [req.user.id, productId]
    );

    if (purchased.count === 0) {
      return res.status(403).json({
        message: "Only customers who purchased this product can leave a review",
      });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO reviews (user_id, product_id, rating, comment)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, productId, rating, comment || null]
      );

      const summary = await getReviewSummary(productId);
      res.status(201).json({
        message: "Review submitted",
        review: {
          id: result.insertId,
          rating,
          comment,
          user_name: req.user.email,
        },
        ...summary,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "You already reviewed this product" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
});

module.exports = router;
