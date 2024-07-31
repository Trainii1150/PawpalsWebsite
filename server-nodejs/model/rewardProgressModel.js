const pool = require('../config/database');
const ItemStorageModel = require('./ItemstorageModel');

const getRandomFoodItem = async () => {
    try {
        const result = await pool.query(
            'SELECT item_id FROM public.items WHERE item_type = $1 ORDER BY RANDOM() LIMIT 1',
            ['food']
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error getting random food item:', error);
        throw new Error('Error getting random food item');
    }
};

const checkAndRewardUser = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // ตรวจสอบคะแนนรวมในวันนี้
        const result = await client.query(`
            SELECT SUM(time) as total_time
            FROM public.coding_activity
            WHERE user_id = $1 AND DATE("Timestamp") = CURRENT_DATE
        `, [userId]);

        const total_time = result.rows[0].total_time || 0;

        if (total_time > 2500) {
            // สุ่มไอเท็มประเภท food
            const foodItem = await getRandomFoodItem();

            // ตรวจสอบว่าไอเท็มนี้มีอยู่ใน storage หรือไม่
            const existingItem = await ItemStorageModel.checkItemInStorageItem(userId, foodItem.item_id);

            if (existingItem) {
                // ถ้ามีอยู่แล้ว ให้เพิ่มจำนวน
                await ItemStorageModel.updateStorageItem(existingItem.storage_id, userId, foodItem.item_id, existingItem.quantity + 1);
            } else {
                // ถ้าไม่มี ให้สร้างใหม่
                await ItemStorageModel.createStorageItem(userId, foodItem.item_id, 1);
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error rewarding user:', error);
        throw new Error('Error rewarding user');
    } finally {
        client.release();
    }
};

module.exports = {
    checkAndRewardUser,
};
