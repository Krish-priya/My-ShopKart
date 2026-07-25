const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool so we can reuse MySQL connections efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "shopkart",
  waitForConnections: true,
  connectionLimit: 10,
});

async function testConnection() {
  const connection = await pool.getConnection();
  console.log("MySQL connected successfully to database:", process.env.DB_NAME);
  connection.release();
}

module.exports = { pool, testConnection };
