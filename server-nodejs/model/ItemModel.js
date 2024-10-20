const pool = require('../config/database'); // Use require instead of import

const createItem = async (item_name, description, item_type, path) => {
    const result = await pool.query(
        'INSERT INTO items (item_name, description, item_type, path) VALUES ($1, $2, $3, $4) RETURNING *',
        [item_name, description, item_type, path]
    );
    console.log(result.rows[0]);
    return result.rows[0];
};

const updateItem = async (item_id, item_name, description, item_type, path) => {
    const result = await pool.query(
        'UPDATE items SET item_name = $1, description = $2, item_type = $3, path = $4 WHERE item_id = $5 RETURNING *',
        [item_name, description, item_type, path, item_id]
    );
    console.log('Item created:', result.rows[0]);
    return result.rows[0];
};

const updateItemWithoutPath = async (item_id, item_name, description, item_type) => {
    try {
        const result = await pool.query(
            'UPDATE items SET item_name = $1, description = $2, item_type = $3 WHERE item_id = $4 RETURNING *',
            [item_name, description, item_type, item_id]
        );
        console.log('Item updated:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error updating item');
    }
};

const deleteItem = async (item_id) => {
    await pool.query('DELETE FROM items WHERE item_id = $1', [item_id]);
};

const getItemById = async (item_id) => {
    const result = await pool.query('SELECT * FROM items WHERE item_id = $1', [item_id]);
    return result.rows[0];
};

const getAllItems = async () => {
    const result = await pool.query('SELECT * FROM items');
    return result.rows;
};

module.exports = {
    createItem,
    updateItem,
    updateItemWithoutPath,
    deleteItem,
    getItemById,
    getAllItems,
};
