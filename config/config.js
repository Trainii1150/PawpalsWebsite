const dotenv = require('dotenv');

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",       // ใช้ค่าจาก .env
    password: process.env.DB_PASSWORD,   
    database: process.env.DB_NAME,       
    host: process.env.DB_HOST,           
    port: process.env.DB_PORT || 5432,   
    dialect: 'postgres' 
  },
  test: {
    username: process.env.DB_USER || "postgres",      
    password: process.env.DB_PASSWORD,   
    database: process.env.DB_NAME,       
    host: process.env.DB_HOST,           
    port: process.env.DB_PORT || 5432,   
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER || "postgres",       
    password: process.env.DB_PASSWORD,   
    database: process.env.DB_NAME,       
    host: process.env.DB_HOST,           
    port: process.env.DB_PORT || 5432,   
    dialect: 'postgres'
  }
};
