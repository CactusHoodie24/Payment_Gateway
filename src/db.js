// config/database.js
require('dotenv').config();
const mysql = require('mysql2/promise'); // Using promise-based mysql2

let connection;

async function connectDB() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,       // e.g., 'localhost'
      user: process.env.DB_USER,       // e.g., 'root'
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('MySQL connected');
    return connection;
  } catch (err) {
    console.error('MySQL connection failed:', err);
    process.exit(1);
  }
}

// Optional: get the connection elsewhere in your app
function getConnection() {
  if (!connection) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return connection;
}

module.exports = { connectDB, getConnection };