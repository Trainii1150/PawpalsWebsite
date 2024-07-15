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

const getUserStorageItems = async (uid) => {
    try {
      const result = await pool.query(`
        SELECT us.storage_id, us.item_id, us.created_at,
               i.item_name, i.description, i.path, i.food_value
        FROM public.user_storage us
        JOIN public.items i ON us.item_id = i.item_id
        WHERE us.user_id = $1
      `, [uid]);
  
      return result.rows.map(row => ({
        storage_id: row.storage_id,
        item_id: row.item_id,
        item_name: row.item_name,
        description: row.description,
        path: row.path,
        food_value: row.food_value,
        created_at: row.created_at.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting user storage items from database:', error);
      throw new Error('Error getting user storage items from database');
    }
};
const getUserActivity = async (userId) => {
    try {
        const result = await pool.query(`
            SELECT "ActivityCode_ID", "Languages", wordcount, coins, "time", "Timestamp", user_id
            FROM public.coding_activity
            WHERE user_id = $1
            ORDER BY "Timestamp" DESC
        `, [userId]);

        return result.rows;
    } catch (error) {
        console.error('Error getting activity data:', error);
        throw new Error('Error getting activity data');
    }
};
const getUserActivityTime = async (uid) => {
    try {
      const result = await pool.query('SELECT SUM(time::FLOAT) AS total_time FROM "coding_activity" WHERE user_id = $1', [uid]);
      return result.rows.length > 0 ? result.rows[0].total_time || 0 : 0;
    } catch (error) {
      console.error('Error getting time from database:', error);
      throw new Error('Error getting time from database');
    }
};
const getUserCoins = async (uid) => {
    try {
      const result = await pool.query(`
        SELECT coins
        FROM public.user_coins
        WHERE user_id = $1
      `, [uid]);
  
      if (result.rows.length > 0) {
        return { coins: parseFloat(result.rows[0].coins) };
      } else {
        const coinsResult = await pool.query(`
          SELECT SUM(coins::FLOAT) AS total_coins
          FROM public.coding_activity
          WHERE user_id = $1
        `, [uid]);
  
        const total_coins = coinsResult.rows[0].total_coins || 0;
  
        await pool.query(`
          INSERT INTO public.user_coins (user_id, coins)
          VALUES ($1, $2)
          ON CONFLICT (user_id)
          DO UPDATE SET coins = $2
        `, [uid, total_coins]);
  
        return { coins: parseFloat(total_coins) };
      }
    } catch (error) {
      console.error('Error getting user coins from database:', error);
      throw new Error('Error getting user coins from database');
    }
  };
   const deductUserCoins = async (uid, amount) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      const userCoinsResult = await client.query('SELECT coins FROM user_coins WHERE user_id = $1', [uid]);
      if (userCoinsResult.rows.length === 0) {
        throw new Error('User not found');
      }
  
      const userCoins = userCoinsResult.rows[0].coins;
  
      if (userCoins < amount) {
        throw new Error('Not enough coins');
      }
  
      const newCoins = userCoins - amount;
      await client.query('UPDATE user_coins SET coins = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [newCoins, uid]);
  
      await client.query('COMMIT');
      return newCoins;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
    getUserStorageItems,
    getUserActivityTime,
    getUserActivity,
    getUserCoins,
    deductUserCoins,
    pool,
};

