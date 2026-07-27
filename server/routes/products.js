const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

const SORT_OPTIONS = {
  newest: "p.id DESC",
  "price-asc": "p.price ASC",
  "price-desc": "p.price DESC",
  "name-asc": "p.name ASC",
  "name-desc": "p.name DESC",
};

const RATING_SELECT = `
  p.*,
  COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
  COUNT(r.id) AS review_count
`;

// GET /api/products/categories
router.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category ASC"
    );
    res.json({ categories: rows.map((row) => row.category) });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { category, search, sort = "newest", limit } = req.query;
    const params = [];
    const where = [];

    if (category && category !== "All") {
      where.push("p.category = ?");
      params.push(category);
    }

    if (search && String(search).trim()) {
      where.push("(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)");
      const term = `%${String(search).trim()}%`;
      params.push(term, term, term);
    }

    let query = `
      SELECT ${RATING_SELECT}
      FROM products p
      LEFT JOIN reviews r ON r.product_id = p.id
    `;
    if (where.length > 0) {
      query += ` WHERE ${where.join(" AND ")}`;
    }

    query += " GROUP BY p.id";

    const orderBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
    query += ` ORDER BY ${orderBy}`;

    const parsedLimit = Number(limit);
    if (parsedLimit > 0) {
      query += " LIMIT ?";
      params.push(parsedLimit);
    }

    const [products] = await pool.query(query, params);
    res.json({ products, count: products.length });
  } catch (error) {
    console.error("Get products error:", error);
    // Fallback if reviews table not migrated yet
    if (error.code === "ER_NO_SUCH_TABLE") {
      try {
        const [products] = await pool.query("SELECT * FROM products ORDER BY id DESC");
        return res.json({
          products: products.map((p) => ({ ...p, avg_rating: 0, review_count: 0 })),
          count: products.length,
        });
      } catch (fallbackError) {
        return res.status(500).json({ message: "Failed to fetch products" });
      }
    }
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${RATING_SELECT}
       FROM products p
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];

    const [related] = await pool.query(
      `SELECT p.id, p.name, p.price, p.image_url, p.category, p.stock,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
              COUNT(r.id) AS review_count
       FROM products p
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.category = ? AND p.id != ?
       GROUP BY p.id
       ORDER BY p.id DESC
       LIMIT 4`,
      [product.category, product.id]
    );

    res.json({ product, related });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

module.exports = router;
