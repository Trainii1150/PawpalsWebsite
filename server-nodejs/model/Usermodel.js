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


const saltRounds = 10;

const createUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const result = await pool.query(
            'INSERT INTO user_table (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error creating user');
    }
};

const getUserEmail = async (email) => {
    try {
        const result = await pool.query('SELECT * FROM user_table WHERE email = $1', [email]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error getting user by email');
    }
};

const getResetpassemail = async (email) => {
    try {
        const user = await pool.query('SELECT email FROM user_table WHERE email = $1', [email]);
        return user.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error getting user by email');
    }
    
};

const getUserByUserId = async () => {
    try {
        const result = await pool.query('SELECT * FROM user_table');
        return result.rows;
    } catch (error) {
        console.error(error);
    }
};

const updateUserVerification = async (user,email) => {
    try{
        const result = await pool.query('UPDATE user_table SET user_verify = true WHERE email = $1',[email]);
        console.log(`${user} of email : ${email} is now verified.`);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to update user verification status');
    }

};

const updatePassword = async (password,email) => {
    try {
        const result = await pool.query('UPDATE user_table SET password = $1 WHERE email = $2',[password,email]);
        console.log(`${email} is now reset password successfully.`);  
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    createUser,
    getUserEmail,
    getUserByUserId,
    updateUserVerification,
    updatePassword,
    getResetpassemail,
    pool,
};

