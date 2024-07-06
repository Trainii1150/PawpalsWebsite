const pool = require('../config/database'); // Use require instead of import

const createItem = async (item_name, description, item_type) => {
    const result = await pool.query(
        'INSERT INTO items (item_name, description, item_type, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [item_name, description, item_type]
    );
    return result.rows[0];
};

const updateItem = async (item_id, item_name, description, item_type) => {
    const result = await pool.query(
        'UPDATE items SET item_name = $1, description = $2, item_type = $3 WHERE item_id = $4 RETURNING *',
        [item_name, description, item_type, item_id]
    );
    return result.rows[0];
};

const deleteItem = async (item_id) => {
    await pool.query('DELETE FROM items WHERE item_id = $1', [item_id]);
};

const updateUserCoins = async (uid) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      const result = await client.query(
        'SELECT SUM(coins::FLOAT) AS total_coins FROM "coding_activity" WHERE user_id = $1',
        [uid]
      );
  
      const totalCoins = result.rows[0].total_coins || 0;
  
      await client.query(
        'INSERT INTO user_coins (user_id, coins) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET coins = EXCLUDED.coins',
        [uid, totalCoins]
      );
  
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  const buyItem = async (uid, item_id) => {
    try {
      const client = await pool.connect();
  
      try {
        await client.query('BEGIN');
  
        // Query for the item price
        const itemResult = await client.query('SELECT price FROM store_items WHERE item_id = $1', [item_id]);
        if (itemResult.rows.length === 0) {
          throw new Error('Item not found');
        }
  
        const itemPrice = itemResult.rows[0].price;
  
        // Query for the user's current coins
        const userCoinsResult = await client.query('SELECT coins FROM user_coins WHERE user_id = $1', [uid]);
        if (userCoinsResult.rows.length === 0) {
          throw new Error('User not found');
        }
  
        const userCoins = userCoinsResult.rows[0].coins;
  
        // Check if the user has enough coins
        if (userCoins < itemPrice) {
          throw new Error('Not enough coins');
        }
  
        // Deduct the item price from the user's coins
        const newCoins = userCoins - itemPrice;
        await client.query('UPDATE user_coins SET coins = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [newCoins, uid]);
  
        // Insert the purchased item into user_storage
        await client.query('INSERT INTO user_storage (user_id, item_id) VALUES ($1, $2)', [uid, item_id]);
  
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
  
      return { success: true, message: 'Item bought successfully' };
    } catch (error) {
      console.error('Error buying item:', error);
      return { success: false, message: 'Error buying item' };
    }
  };
  
  module.exports = {
    buyItem,
    // ... (ฟังก์ชันอื่นๆ เช่น createItem, updateItem, deleteItem)
  };
  

module.exports = {
    buyItem,
};


module.exports = {
    createItem,
    updateItem,
    deleteItem,
    updateUserCoins,
    buyItem
};
