// config/database.js
require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

async function connectDB() {
  try {
    pool = mysql.createPool({
      host:               process.env.DB_HOST,
      user:               process.env.DB_USER,
      password:           process.env.DB_PASSWORD,
      database:           process.env.DB_NAME,
      port:               process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      enableKeepAlive:    true,
      keepAliveInitialDelay: 0
    });

    // Test the connection
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();

  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
}

function getConnection() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return pool;
}

module.exports = { connectDB, getConnection };