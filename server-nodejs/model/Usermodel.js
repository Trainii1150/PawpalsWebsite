const bcrypt = require('bcrypt');
const pool = require('../config/database'); // Use require instead of import

const saltRounds = 10;

const createUser = async (username, email, hashedPassword) => {
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

const getUserData = async (email) => {
    try {
        const result = await pool.query('SELECT user_id,username, email, password , user_verify FROM user_table WHERE email = $1', [email]);
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

const findbyEmail = async (email) => {
    try {
        const result = await pool.query('SELECT email FROM user_table WHERE email = $1', [email]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
}

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
};

const deleteUserById = async (userId) => {
    const result = await pool.query(
        'DELETE FROM user_table WHERE user_id = $1 RETURNING *',
        [userId]
    );
    return result.rows[0];
};

module.exports = {
    createUser,
    getUserData,
    getUserByUserId,
    updateUserVerification,
    updatePassword,
    getResetpassemail,
    findbyEmail,
    deleteUserById,
    pool,
};

