// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'luct_reporting',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  ssl: {
    rejectUnauthorized: false
  }
});


const promisePool = pool.promise();

module.exports = promisePool;