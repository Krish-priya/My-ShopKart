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

  const sql = fs.readFileSync(
    path.join(__dirname, "..", "sql", "migrate_profile.sql"),
    "utf8"
  );
  await connection.query(sql);

  const [cols] = await connection.query("SHOW COLUMNS FROM users");
  const names = cols.map((c) => c.Field);
  console.log("Profile migration complete");
  console.log("users.phone:", names.includes("phone"));
  console.log("users.address:", names.includes("address"));
  await connection.end();
}

migrate().catch((error) => {
  console.error("Profile migration failed:", error.message);
  process.exit(1);
});
