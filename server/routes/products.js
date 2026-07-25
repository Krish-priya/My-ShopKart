const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

const SORT_OPTIONS = {
  newest: "id DESC",
  "price-asc": "price ASC",
  "price-desc": "price DESC",
  "name-asc": "name ASC",
  "name-desc": "name DESC",
};

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
// Query: ?search=phone&category=Electronics&sort=price-asc&limit=4
router.get("/", async (req, res) => {
  try {
    const { category, search, sort = "newest", limit } = req.query;
    const params = [];
    const where = [];

    if (category && category !== "All") {
      where.push("category = ?");
      params.push(category);
    }

    if (search && String(search).trim()) {
      where.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
      const term = `%${String(search).trim()}%`;
      params.push(term, term, term);
    }

    let query = "SELECT * FROM products";
    if (where.length > 0) {
      query += ` WHERE ${where.join(" AND ")}`;
    }

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
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];

    // Related items from same category (excluding current product)
    const [related] = await pool.query(
      `SELECT id, name, price, image_url, category, stock
       FROM products
       WHERE category = ? AND id != ?
       ORDER BY id DESC
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
