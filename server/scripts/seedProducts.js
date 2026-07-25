/**
 * Upserts the full catalog (~36 products): adds missing names, refreshes image URLs.
 * Usage: npm run db:seed-products
 */
require("dotenv").config();
const mysql = require("mysql2/promise");
const { products } = require("../data/products");

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "shopkart",
  });

  let inserted = 0;
  let updated = 0;

  for (const product of products) {
    const [existing] = await connection.query(
      "SELECT id FROM products WHERE name = ?",
      [product.name]
    );

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

  const [countRows] = await connection.query("SELECT COUNT(*) AS count FROM products");
  console.log(`Products seeded. inserted=${inserted}, updated=${updated}, total=${countRows[0].count}`);
  await connection.end();
}

seed().catch((error) => {
  console.error("Product seed failed:", error.message);
  process.exit(1);
});
