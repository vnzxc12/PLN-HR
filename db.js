// db.js
const mysql = require('mysql2');
require('dotenv').config();

let pool;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }).promise();
}

function initDb() {
  pool = createPool();

  // Keep-alive
  setInterval(async () => {
    try {
      await pool.query('SELECT 1');
      console.log('MySQL keep-alive ping sent');
    } catch (err) {
      console.error('MySQL keep-alive failed:', err.code);
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('🔄 Reconnecting MySQL pool...');
        pool = createPool();
      }
    }
  }, 60000);
}

initDb();

module.exports = {
  query: (...args) => pool.query(...args),
  getPool: () => pool
};
