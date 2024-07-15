const pool = require('../config/database');

const getStoreItems = async () => {
  try {
    const result = await pool.query(`
      SELECT si.store_item_id, si.item_id, si.price, si.created_at,
             i.item_name, i.description, i.path, i.food_value
      FROM public.store_items si
      JOIN public.items i ON si.item_id = i.item_id
    `);

    return result.rows.map(row => ({
      store_item_id: row.store_item_id,
      item_id: row.item_id,
      item_name: row.item_name,
      description: row.description,
      path: row.path,
      price: row.price,
      food_value: row.food_value,
      created_at: row.created_at.toISOString(),
    }));
  } catch (error) {
    console.error('Error getting store items from database:', error);
    throw new Error('Error getting store items from database');
  }
};

const addStoreItem = async (itemId, price) => {
  try {
    const result = await pool.query(
      'INSERT INTO store_items (item_id, price, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [itemId, price]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding store item:', error);
    throw new Error('Error adding store item');
  }
};

const updateStoreItem = async (storeItemId, itemId, price) => {
  try {
    const result = await pool.query(
      'UPDATE store_items SET item_id = $1, price = $2 WHERE store_item_id = $3 RETURNING *',
      [itemId, price, storeItemId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating store item:', error);
    throw new Error('Error updating store item');
  }
};

const deleteStoreItem = async (storeItemId) => {
  try {
    const result = await pool.query('DELETE FROM store_items WHERE store_item_id = $1 RETURNING *', [storeItemId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting store item:', error);
    throw new Error('Error deleting store item');
  }
};

module.exports = {
  getStoreItems,
  addStoreItem,
  updateStoreItem,
  deleteStoreItem,
};
