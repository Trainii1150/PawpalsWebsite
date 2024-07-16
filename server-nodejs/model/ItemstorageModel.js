const pool = require('../config/database');

const createStorageItem = async (userId, itemId, quantity) => {
    const result = await pool.query(
        'INSERT INTO user_storage (user_id, item_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [userId, itemId, quantity]
    );
    return result.rows[0];
};

const updateStorageItem = async (storageId, userId, itemId, quantity) => {
    const result = await pool.query(
        'UPDATE user_storage SET quantity = $4 WHERE storage_id = $1 AND user_id = $2 AND item_id = $3 RETURNING *',
        [storageId, userId, itemId, quantity]
    );
    return result.rows[0];
};

const deleteStorageItem = async (storageId, userId, itemId) => {
    const result = await pool.query(
        'DELETE FROM user_storage WHERE storage_id = $1 AND user_id = $2 AND item_id = $3 RETURNING *',
        [storageId, userId, itemId]
    );
    return result.rows[0];
};

const deleteFoodItem = async (storageId) => {
  await pool.query(`
    DELETE FROM user_storage
    WHERE storage_id = $1
  `, [storageId]);
};

const checkItemInStorageItem = async (userId, itemId) => {
    const result = await pool.query(
        'SELECT * FROM user_storage WHERE user_id = $1 AND item_id = $2',
        [userId, itemId]
    );
    return result.rows[0];
};

const getItemPrice = async (itemId) => {
    const result = await pool.query('SELECT price FROM store_items WHERE item_id = $1', [itemId]);
    if (result.rows.length === 0) {
        throw new Error('Item not found');
    }
    return result.rows[0].price;
};

const getFoodItem = async (uid, foodValue) => {
  const result = await pool.query(`
    SELECT us.storage_id, us.quantity 
    FROM user_storage us
    JOIN items i ON us.item_id = i.item_id
    WHERE us.user_id = $1 AND i.food_value = $2 AND us.quantity > 0
  `, [uid, foodValue]);

  return result.rows[0];
};

const updateFoodQuantity = async (storageId, newQuantity) => {
  await pool.query(`
    UPDATE user_storage
    SET quantity = $1
    WHERE storage_id = $2
  `, [newQuantity, storageId]);
};

module.exports = {
    createStorageItem,
    updateStorageItem,
    deleteStorageItem,
    checkItemInStorageItem,
    getItemPrice,
    getFoodItem,
    deleteFoodItem,
    updateFoodQuantity,
};