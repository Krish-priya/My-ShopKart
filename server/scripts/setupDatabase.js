/**
 * Runs schema.sql + seeds products and a default admin user.
 * Usage: npm run db:setup
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const { products } = require("../data/products");

async function ensureColumn(connection, table, column, definition) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (rows[0].count === 0) {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`Added ${table}.${column}`);
  }
}

async function setup() {
  if (!process.env.DB_USER) {
    console.error("Missing .env file. Add your MySQL username and password first.");
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "shopkart",
    multipleStatements: true,
  });

  console.log("Connected to MySQL. Creating tables...");

  const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await connection.query(schemaSql);
  console.log(
    "Tables created: users, products, cart_items, wishlist, orders, order_items"
  );

  await ensureColumn(connection, "users", "phone", "VARCHAR(20) NULL AFTER email");
  await ensureColumn(connection, "users", "address", "TEXT NULL AFTER phone");

  let inserted = 0;
  let updated = 0;
  for (const product of products) {
    const [existing] = await connection.query("SELECT id FROM products WHERE name = ?", [
      product.name,
    ]);
    if (existing.length > 0) {
      await connection.query(
        `UPDATE products
         SET description = ?, price = ?, image_url = ?, category = ?, stock = ?
         WHERE id = ?`,
        [
          product.description,
          product.price,
          product.image_url,
          product.category,
          product.stock,
          existing[0].id,
        ]
      );
      updated += 1;
    } else {
      await connection.query(
        `INSERT INTO products (name, description, price, image_url, category, stock)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.description,
          product.price,
          product.image_url,
          product.category,
          product.stock,
        ]
      );
      inserted += 1;
    }
  }
  console.log(`Products ready: inserted=${inserted}, updated=${updated}, catalog=${products.length}`);

  const [admins] = await connection.query("SELECT id FROM users WHERE email = ?", [
    "admin@shopkart.com",
  ]);

  if (admins.length === 0) {
    const hashed = await bcrypt.hash("admin123", 10);
    await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')",
      ["Admin", "admin@shopkart.com", hashed]
    );
    console.log("Created admin user: admin@shopkart.com / admin123");
  } else {
    console.log("Admin user already exists");
  }

  await connection.end();
  console.log("Database setup complete!");
}

setup().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exit(1);
});
