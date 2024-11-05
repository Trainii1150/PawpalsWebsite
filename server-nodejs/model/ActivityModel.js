const pool = require('../config/database');

// ฟังก์ชั่นเพื่อเพิ่มข้อมูลกิจกรรมใหม่
const addActivity = async (activity) => {
    const { ActivityCode_ID, Languages, wordcount, coins, time, Timestamp, user_id } = activity;
    try {
        const result = await pool.query(`
            INSERT INTO public.coding_activity ("ActivityCode_ID", "Languages", wordcount, coins, "time", "Timestamp", user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [ActivityCode_ID, Languages, wordcount, coins, time, Timestamp, user_id]);

        return result.rows[0];
    } catch (error) {
        console.error('Error adding activity data:', error);
        throw new Error('Error adding activity data');
    }
};

// ฟังก์ชั่นเพื่ออัปเดตข้อมูลกิจกรรม
const updateActivity = async (ActivityCode_ID, activity) => {
    const { Languages, wordcount, coins, time, Timestamp, user_id } = activity;
    try {
        const result = await pool.query(`
            UPDATE public.coding_activity
            SET "Languages" = $2, wordcount = $3, coins = $4, "time" = $5, "Timestamp" = $6, user_id = $7
            WHERE "ActivityCode_ID" = $1
            RETURNING *
        `, [ActivityCode_ID, Languages, wordcount, coins, time, Timestamp, user_id]);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating activity data:', error);
        throw new Error('Error updating activity data');
    }
};

// ฟังก์ชั่นเพื่อลบข้อมูลกิจกรรม
const deleteActivity = async (ActivityCode_ID) => {
    try {
        const result = await pool.query(`
            DELETE FROM public.coding_activity
            WHERE "ActivityCode_ID" = $1
            RETURNING *
        `, [ActivityCode_ID]);

        return result.rows[0];
    } catch (error) {
        console.error('Error deleting activity data:', error);
        throw new Error('Error deleting activity data');
    }
};

// ฟังก์ชั่นเพื่อดึงข้อมูลกิจกรรมทั้งหมดตาม user_id
const getActivitiesByUserId = async (user_id) => {
    try {
        const result = await pool.query(`
            SELECT * FROM public.coding_activity
            WHERE user_id = $1
            ORDER BY "Timestamp" DESC
        `, [user_id]);

        return result.rows;
    } catch (error) {
        console.error('Error getting activities by user ID:', error);
        throw new Error('Error getting activities by user ID');
    }
};
const getAllActivities = async () => {
    try {
      const result = await pool.query('SELECT * FROM coding_activity');
      return result.rows;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Error fetching activities');
    }
  };
// ฟังก์ชั่นเพื่อคำนวณเวลาทั้งหมดของกิจกรรมที่ทำโดยผู้ใช้ในแต่ละภาษา
const getTotalTimeByLanguage = async (user_id) => {
    try {
        const result = await pool.query(`
            SELECT "Languages", SUM("time") AS total_time
            FROM public.coding_activity
            WHERE user_id = $1
            GROUP BY "Languages"
        `, [user_id]);

        return result.rows;
    } catch (error) {
        console.error('Error getting total time by language:', error);
        throw new Error('Error getting total time by language');
    }
};

// ฟังก์ชั่นเพื่อดึงข้อมูลเวลารวมทั้งหมดของผู้ใช้
const getTotalActivityTime = async (user_id) => {
    try {
        const result = await pool.query(`
            SELECT SUM("time") AS total_time
            FROM public.coding_activity
            WHERE user_id = $1
        `, [user_id]);

        return result.rows[0].total_time || 0; // Return 0 if no activities found
    } catch (error) {
        console.error('Error getting total activity time:', error);
        throw new Error('Error getting total activity time');
    }
};

module.exports = {
    getAllActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    getActivitiesByUserId,
    getTotalTimeByLanguage,
    getTotalActivityTime,
};
