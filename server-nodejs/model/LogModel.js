const pool = require('../config/database');

// ฟังก์ชันบันทึกการซื้อสินค้า
const logPurchase = async (userId, itemId, quantity, price) => {
  try {
    await pool.query(
      'INSERT INTO purchase_logs (user_id, item_id, quantity, price, timestamp) VALUES ($1, $2, $3, $4, NOW())',
      [userId, itemId, quantity, price]
    );
    console.log('Purchase logged successfully');
  } catch (error) {
    console.error('Error logging purchase:', error);
    throw new Error('Error logging purchase');
  }
};

// ฟังก์ชันบันทึกการให้อาหารสัตว์เลี้ยง
const logFeedPet = async (userId, petId, itemId, quantity) => {
    try {
        const result = await pool.query(
            `INSERT INTO feed_logs (user_id, pet_id, item_id, quantity, timestamp)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [userId, petId, itemId, quantity]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error logging feed pet action:', error);
        throw new Error('Error logging feed pet action');
    }
};

const getPurchaseLogs = async () => {
    const query = 'SELECT * FROM purchase_logs ORDER BY timestamp DESC';
    const result = await pool.query(query);
    return result.rows;
};

// ดึง log การให้อาหารสัตว์เลี้ยง
// ดึง log การให้อาหารสัตว์เลี้ยงพร้อมข้อมูล food_value จากตาราง items
const getFeedLogs = async () => {
    const query = `
        SELECT 
            feed_logs.log_id,
            feed_logs.user_id,
            feed_logs.pet_id,
            feed_logs.item_id,
            items.food_value,
            feed_logs.timestamp
        FROM 
            feed_logs
        JOIN 
            items ON feed_logs.item_id = items.item_id
        ORDER BY 
            feed_logs.timestamp DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};


module.exports = {
  logPurchase,
  getFeedLogs,
  getPurchaseLogs,
  logFeedPet,
};

