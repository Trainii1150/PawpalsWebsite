const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config()

const pool = new Pool({
    user: process.env.Pool_Username,
    host: process.env.Pool_Host,
    database: process.env.Pool_Database,
    password: process.env.Pool_Password,
    port: process.env.Pool_Port,
});

const saltRounds = 10;

const createUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error creating user');
    }
};

module.exports = {
    createUser,
};
