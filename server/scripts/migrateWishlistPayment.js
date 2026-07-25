/**
 * Applies wishlist + payment_status migration to an existing DB.
 * Usage: node scripts/migrateWishlistPayment.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "shopkart",
    multipleStatements: true,
  });

  const sqlPath = path.join(__dirname, "..", "sql", "migrate_wishlist_payment.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await connection.query(sql);

  const [cols] = await connection.query(
    "SHOW COLUMNS FROM orders LIKE 'payment_status'"
  );
  const [method] = await connection.query(
    "SHOW COLUMNS FROM orders LIKE 'payment_method'"
  );
  const [tbl] = await connection.query("SHOW TABLES LIKE 'wishlist'");

  console.log("Migration complete");
  console.log("payment_status:", cols[0]?.Type || "missing");
  console.log("payment_method:", method[0]?.Type || "missing");
  console.log("wishlist table:", tbl.length > 0 ? "yes" : "no");

  await connection.end();
}

migrate().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
