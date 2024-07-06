const pool = require('../config/database'); // Use require instead of import

const createStorageItem = async (userid, itemid, quantity) => {
    try {
        const result = await pool.query(
            'INSERT INTO storage (user_id, item_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [userid, itemid, quantity]
        );

        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
    
};

const checkItemInStorageItem = async (userid, itemid) => {
    try {
        const result = await pool.query(
            'SELECT * FROM storage WHERE user_id = $1 AND item_id = $2',
            [userid, itemid]
        );   

        return result.rows[0]; 
    } catch (error) {
        console.error(error);
    }    
};

const updateStorageItem = async (storageId, userId, itemId, quantity) => {
   try {
        const result = await pool.query(
            'UPDATE storage SET quantity = $4 WHERE storage_id = $1 AND user_id = $2 AND item_id = $3 RETURNING *',
            [storageId, userId, itemId, quantity]
        );
        return result.rows[0];
   } catch (error) {
        console.error(error);
   }
};

const deleteStorageItem = async (storageId, userId, itemId) => {
   try {
        const result = await pool.query(
            'DELETE FROM storage WHERE storage_id = $1 AND user_id = $2 AND item_id = $3 RETURNING *',
            [storageId, userId, itemId]
        );
        return result.rows[0];
   } catch (error) {
        console.error(error);
   }
};

module.exports = {
    createStorageItem,
    checkItemInStorageItem,
    updateStorageItem,
    deleteStorageItem,
    pool
};