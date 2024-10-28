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

const getAllUsers = async () => {
  try {
      const result = await pool.query('SELECT user_id, username, email, role, ban FROM user_table');
      return result.rows;
  } catch (error) {
      console.error(error);
      throw new Error('Error fetching users');
  }
};

const getUserData = async (email) => {
    try {
        const result = await pool.query('SELECT user_id,username, email, user_verify , role , ban , first_login FROM user_table WHERE email = $1', [email]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error getting user by email');
    }
};


const updateFirstLoginStatus = async (userId) => {
  try {
      const result = `UPDATE user_table SET first_login = false WHERE user_id = $1`;
      return result.rows[0];
  } catch (error) {
      console.error(error);
  }
};

async function setSelectedPet(uid, pet_id) {
  try {
    // ตรวจสอบว่ามีการตั้งค่าในตาราง user_settings สำหรับผู้ใช้นี้หรือไม่
    const checkUserSettings = await pool.query(
      'SELECT user_id FROM user_settings WHERE user_id = $1',
      [uid]
    );

    if (checkUserSettings.rows.length === 0) {
      // หากไม่มี ให้สร้างการตั้งค่าใหม่ใน user_settings
      await pool.query(
        'INSERT INTO user_settings (user_id, selected_pet_id) VALUES ($1, $2)',
        [uid, pet_id]
      );

    } else {
      // หากมีอยู่แล้ว ให้ทำการอัปเดต selected_pet_id
      await pool.query(
        'UPDATE user_settings SET selected_pet_id = $1 WHERE user_id = $2',
        [pet_id, uid]
      );
    }

    console.log(`Selected pet for user ${uid} updated to pet ID: ${pet_id}`);
  } catch (error) {
    console.error('Error in setSelectedPet:', error);
    throw new Error('Failed to set selected pet');
  }
}


const findbyEmail = async (email) => {
    try {
        const result = await pool.query('SELECT email FROM user_table WHERE email = $1', [email]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
}

const findRoleById = async (uid) => {
    try {
        const result = await pool.query('SELECT role FROM user_table WHERE user_id = $1',[uid]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
}

const updateUserInfo = async (userid, newUsername, newPassword, newRole) => {
    try {
      console.log(userid)
      const result = await pool.query('UPDATE user_table SET username = $1 , password = $2 , role = $3 WHERE user_id = $4', [newUsername, newPassword, newRole, userid]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
    }
};

const deleteUserInfo  = async (userid) => {
    try {
      const result = await pool.query('DELETE FROM user_table WHERE user_id = $1 RETURNING *', [userid]);
      return result.rows[0];
    } catch (error) {
       console.error(error);
    }
};

const updateUserVerification = async (email) => {
    try{
        const result = await pool.query('UPDATE user_table SET user_verify = true WHERE email = $1',[email]);
        console.log(`this account is now verified.`);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to update user verification status');
    }
};

const getpasswordbyemail = async (email) => {
      try {
        const result = await pool.query('SELECT password FROM user_table WHERE email = $1', [email]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error getting user by email');
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

const setBan = async (userId, banStatus) => {
    try {
      await pool.query('UPDATE user_table SET ban = $1 WHERE user_id = $2', [banStatus, userId]);
    } catch (error) {
      console.error(error);
      throw error; 
    }
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
      SELECT "ActivityCode_ID", "Languages", wordcount, coins, "time", "Timestamp", "code_references", "paste_count", "file_name", "project_name", user_id
      FROM public.coding_activity
      WHERE user_id = $1
      ORDER BY "Timestamp" DESC
    `, [userId]);

    console.log('User Activity Data:', result.rows); // ตรวจสอบข้อมูลที่ดึงมา

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

const getUserBackgrounds = async (uid) => {
  try {
    const result = await pool.query(`
      SELECT us.storage_id, us.item_id, us.quantity, us.created_at,
             i.item_name, i.path
      FROM user_storage us
      JOIN items i ON us.item_id = i.item_id
      WHERE us.user_id = $1 AND i.item_type = 'background'
    `, [uid]);
    return result.rows || [];
  } catch (error) {
    console.error('Error getting user backgrounds:', error);
    throw new Error('Error getting user backgrounds');
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

const getUserPets = async (uid) => {
  try {
    const result = await pool.query(`
      SELECT p.pet_id, p.pet_name, up.hunger_level, up.last_fed, p.path, up.exp 
      FROM user_pets up 
      JOIN pets p ON up.pet_id = p.pet_id 
      WHERE up.user_id = $1
    `, [uid]);

    if (result.rows.length === 0) {
      console.log('No pets found for user:', uid); // เพิ่มการ debug
      return [];
    }

    const pets = result.rows.map(pet => {
      const now = new Date();
      const lastFed = new Date(pet.last_fed);
      const hoursPassed = Math.floor((now - lastFed) / (1000 * 60 * 60));
      const newHungerLevel = Math.max(pet.hunger_level - hoursPassed, 0);
      return { ...pet, hunger_level: newHungerLevel };
    });

    // Update hunger levels in the database
    for (const pet of pets) {
      console.log('Updating hunger level for pet:', pet); // เพิ่มการ debug
      await pool.query(`
        UPDATE user_pets
        SET hunger_level = $1, last_fed = $2
        WHERE user_id = $3 AND pet_id = $4
      `, [pet.hunger_level, new Date(), uid, pet.pet_id]);
    }

    return pets;
  } catch (error) {
    console.error('Error getting user pets:', error);
    throw error;
  }
};
const getResetpassemail = async (email) => {
  try {
      const result = await pool.query('SELECT email FROM user_table WHERE email = $1', [email]);
      return result.rows[0];
  } catch (error) {
      console.error(error);
      throw new Error('Error getting user by email');
  }
  
};
feedPet: async (userId, petId, foodValue) => {
  // อัปเดตข้อมูลสัตว์เลี้ยงในฐานข้อมูล (เช่น การลด hunger_level)
  const result = await pool.query(
    'UPDATE pets SET hunger_level = hunger_level + $1 WHERE pet_id = $2 RETURNING *',
    [foodValue, petId]
  );

  return result.rows[0]; // ส่งคืนข้อมูลสัตว์เลี้ยงที่อัปเดตแล้ว
},

getUserSettings = async (uid) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [uid]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw new Error('Error getting user settings');
  }
};

  
module.exports = {
    createUser,
    getUserSettings,
    getUserData,
    updateFirstLoginStatus,
    findRoleById,
    updateUserVerification,
    getpasswordbyemail,
    updatePassword,
    getResetpassemail,
    findbyEmail,
    deleteUserById,
    setSelectedPet,
    deleteUserInfo,
    updateUserInfo,
    getUserStorageItems,
    getUserActivityTime,
    getUserActivity,
    getUserCoins,
    deductUserCoins,
    getTimeByLanguage,
    getUserPets,
    getAllUsers,
    getUserBackgrounds,
    setBan,
};
