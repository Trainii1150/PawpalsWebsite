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



  

const getTimeByLanguage = async (uid) => {
    try {
        const result = await pool.query(`
            SELECT "Languages", SUM("time") as total_time
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

module.exports = {
    addActivity,
    updateActivity,
    deleteActivity,
    getTimeByLanguage,
};
