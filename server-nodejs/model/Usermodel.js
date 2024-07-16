const bcrypt = require('bcrypt');
const pool = require('../config/database'); // Use require instead of import
const ItemStorageModel = require('./ItemstorageModel'); // ตรวจสอบให้แน่ใจว่าได้ import ไฟล์นี้ถูกต้อง
const PetModel = require('./PetModel'); // ตรวจสอบให้แน่ใจว่าได้ import ไฟล์นี้ถูกต้อง
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
        SELECT us.storage_id, us.item_id, us.quantity,us.created_at,
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
        quantity: row.quantity
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
const getTimeByLanguage = async (uid) => {
    try {
      const result = await pool.query(`
        SELECT "Languages" as language, SUM("time") as total_time
        FROM public.coding_activity
        WHERE user_id = $1
        GROUP BY "Languages"
      `, [uid]);
  
      return result.rows;
    } catch (error) {
      console.error('Error getting time by language:', error);
      throw new Error('Error getting time by language');
    }
  };

  const getUserPet = async (uid) => {
    try {
      const result = await pool.query(`
        SELECT p.pet_id, p.pet_name, up.hunger_level, up.last_fed 
        FROM user_pets up 
        JOIN pets p ON up.pet_id = p.pet_id 
        WHERE up.user_id = $1
      `, [uid]);
  
      if (result.rows.length === 0) {
        throw new Error('Pet not found for this user');
      }
  
      const pet = result.rows[0];
      const now = new Date();
      const lastFed = new Date(pet.last_fed);
      const hoursPassed = Math.floor((now - lastFed) / (1000 * 60 * 60));
      const newHungerLevel = Math.max(pet.hunger_level - hoursPassed, 0);
  
      // อัปเดต hunger_level และ last_fed ในฐานข้อมูล
      await pool.query(`
        UPDATE user_pets
        SET hunger_level = $1, last_fed = $2
        WHERE user_id = $3 AND pet_id = $4
      `, [newHungerLevel, now, uid, pet.pet_id]);
  
      return { ...pet, hunger_level: newHungerLevel };
    } catch (error) {
      console.error('Error getting user pet:', error);
      throw error;
    }
  };
  
  const randomizePet = async (userId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      const petsResult = await client.query('SELECT * FROM pets');
      const pets = petsResult.rows;
  
      if (pets.length === 0) {
        throw new Error('No pets available');
      }
  
      const randomPet = pets[Math.floor(Math.random() * pets.length)];
  
      const result = await client.query(
        'INSERT INTO user_pets (user_id, pet_id, pet_name) VALUES ($1, $2, $3) RETURNING *',
        [userId, randomPet.pet_id, randomPet.pet_name]
      );
  
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error randomizing pet:', error);
      throw error;
    } finally {
      client.release();
    }
  };
  
  const feedPet = async (uid, petId, foodValue, itemId) => {
    try {
      // ตรวจสอบการมีอยู่ของอาหารในช่องเก็บของผู้ใช้
      const foodItem = await ItemStorageModel.getFoodItem(uid, foodValue);
      if (!foodItem || foodItem.quantity === 0) {
        throw new Error('Food item not found or quantity is zero');
      }
  
      // อัปเดตระดับความหิวของสัตว์เลี้ยง
      await PetModel.updateHungerLevel(petId, foodValue);
  
      // ลดจำนวนอาหารในช่องเก็บของ
      await ItemStorageModel.updateFoodQuantity(foodItem.storage_id, foodItem.quantity - 1);
  
      // ถ้าจำนวนอาหารเหลือ 0 ลบรายการออกจากช่องเก็บของ
      if (foodItem.quantity - 1 === 0) {
        await ItemStorageModel.deleteFoodItem(foodItem.storage_id);
      }
  
      return { message: 'Pet fed successfully' };
    } catch (error) {
      console.error('Error feeding pet:', error);
      throw error;
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
    getTimeByLanguage,
    feedPet,
    getUserPet,
    randomizePet,
};

