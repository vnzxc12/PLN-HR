// db.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  enableKeepAlive: true, // ✅ keeps TCP alive
  keepAliveInitialDelay: 0
});

// Export the promised version of the pool
const db = pool.promise();

// ✅ Keep connection alive every 60s
setInterval(async () => {
  try {
    await db.query('SELECT 1');
    console.log('MySQL keep-alive ping sent');
  } catch (err) {
    console.error('MySQL keep-alive failed', err);
  }
}, 60000);

console.log('✅ Connected to Railway MySQL DB');

module.exports = db;
