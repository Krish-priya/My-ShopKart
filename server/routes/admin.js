const express = require("express");
const { pool } = require("../config/db");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { productRules } = require("../middleware/validators");

const router = express.Router();

router.use(authenticate, requireAdmin);

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function parseProductBody(body) {
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const image_url = String(body.image_url || "").trim();
  const category = String(body.category || "General").trim() || "General";
  const price = Number(body.price);
  const stock = Number(body.stock);

  if (!name) {
    return { error: "Product name is required" };
  }

  if (Number.isNaN(price) || price < 0) {
    return { error: "Please enter a valid price" };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "Please enter a valid stock quantity" };
  }

  return {
    product: { name, description, price, image_url, category, stock },
  };
}

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [[productCount]] = await pool.query("SELECT COUNT(*) AS count FROM products");
    const [[userCount]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'user'"
    );
    const [[orderCount]] = await pool.query("SELECT COUNT(*) AS count FROM orders");
    const [[revenue]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'cancelled'"
    );

    res.json({
      products: productCount.count,
      users: userCount.count,
      orders: orderCount.count,
      revenue: Number(revenue.total),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// GET /api/admin/analytics — chart data
router.get("/analytics", async (req, res) => {
  try {
    const [revenueByDay] = await pool.query(
      `SELECT DATE(created_at) AS day,
              COALESCE(SUM(total_amount), 0) AS revenue,
              COUNT(*) AS orders
       FROM orders
       WHERE status != 'cancelled'
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );

    const [ordersByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM orders
       GROUP BY status
       ORDER BY count DESC`
    );

    const [topProducts] = await pool.query(
      `SELECT p.id, p.name,
              COALESCE(SUM(oi.quantity), 0) AS units_sold,
              COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'cancelled'
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 8`
    );

    res.json({
      revenueByDay: revenueByDay.map((row) => ({
        day: row.day,
        revenue: Number(row.revenue),
        orders: Number(row.orders),
      })),
      ordersByStatus: ordersByStatus.map((row) => ({
        status: row.status,
        count: Number(row.count),
      })),
      topProducts: topProducts.map((row) => ({
        id: row.id,
        name: row.name,
        units_sold: Number(row.units_sold),
        revenue: Number(row.revenue),
      })),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ message: "Failed to load analytics" });
  }
});

// GET /api/admin/products
router.get("/products", async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json({ products });
  } catch (error) {
    console.error("Admin products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/admin/orders
router.get("/orders", async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.payment_method, o.payment_status,
              o.shipping_address, o.phone, o.created_at,
              u.name AS customer_name, u.email AS customer_email,
              COALESCE(SUM(oi.quantity), 0) AS item_count
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// PUT /api/admin/orders/:id/status  { status }
router.put("/orders/:id/status", async (req, res) => {
  try {
    const status = String(req.body.status || "").toLowerCase();

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", status });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// POST /api/admin/products
router.post("/products", productRules, validate, async (req, res) => {
  try {
    const parsed = parseProductBody(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const { name, description, price, image_url, category, stock } = parsed.product;

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, image_url, category, stock]
    );

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);

    res.status(201).json({
      message: "Product created",
      productId: result.insertId,
      product: rows[0],
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PUT /api/admin/products/:id
router.put("/products/:id", productRules, validate, async (req, res) => {
  try {
    const parsed = parseProductBody(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const { name, description, price, image_url, category, stock } = parsed.product;

    const [result] = await pool.query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock = ?
       WHERE id = ?`,
      [name, description, price, image_url, category, stock, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);

    res.json({ message: "Product updated", product: rows[0] });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    // Product used in past orders cannot be deleted safely
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.errno === 1451) {
      return res.status(400).json({
        message: "Cannot delete this product because it is used in existing orders. Set stock to 0 instead.",
      });
    }

    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
