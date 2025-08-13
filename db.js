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

async function queryWithReconnect(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.warn('⚠️ MySQL connection lost, reconnecting...');
      pool = createPool();
      return await pool.query(sql, params); // retry once
    }
    throw err;
  }
}

module.exports = { query: queryWithReconnect };
