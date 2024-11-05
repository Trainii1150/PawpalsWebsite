const pool = require('../config/database');

// ฟังก์ชันสำหรับดึงข้อมูล progress ของผู้ใช้
const getProgressByUser = async (userId) => {
    const result = await pool.query(
      `SELECT rp.progress, rp.item_id, i.path as item_path
       FROM public.reward_progress rp
       JOIN public.items i ON rp.item_id = i.item_id
       WHERE rp.user_id = $1`,
      [userId]
    );
    
    // ตรวจสอบและแสดงผลลัพธ์การ query
    if (result.rows.length > 0) {
      console.log("Query Result:", result.rows[0]); // แสดงผลการ query เพื่อตรวจสอบค่า path
      return result.rows[0];
    } else {
      console.log("No progress data found for userId:", userId);
      return null;
    }
  };
  
  

// ฟังก์ชันสำหรับรีเซ็ต progress ของผู้ใช้
const resetProgress = async (userId) => {
  await pool.query(
    'UPDATE public.reward_progress SET progress = 0 WHERE user_id = $1',
    [userId]
  );
};

// ฟังก์ชันสำหรับสุ่ม item โดยไม่รวม item ที่เป็น background
const getRandomItemExcludingBackground = async () => {
  const result = await pool.query(
    `SELECT item_id, item_name, path FROM public.items WHERE item_type != 'background' ORDER BY RANDOM() LIMIT 1`
  );
  return result.rows[0];
};

// ฟังก์ชันสำหรับอัปเดต progress ของผู้ใช้และสุ่ม item ใหม่
const updateUserProgress = async (userId) => {
  const randomItem = await getRandomItemExcludingBackground();
  await pool.query(
    'UPDATE public.reward_progress SET item_id = $1, progress = 0 WHERE user_id = $2',
    [randomItem.item_id, userId]
  );

  return randomItem;
};

module.exports = {
  getProgressByUser,
  resetProgress,
  updateUserProgress,
  getRandomItemExcludingBackground,
};
