const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const pool = new Pool({
    user: process.env.Pool_Username,
    host: process.env.Pool_Host,
    database: process.env.Pool_Database,
    password: process.env.Pool_Password,
    port: process.env.Pool_Port,
});

// Open the connection when your application starts
pool.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database!');
    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database:', err);
    });

// Close the pool when your application exits
process.on('exit', () => {
    pool.end();
});

module.exports = pool;