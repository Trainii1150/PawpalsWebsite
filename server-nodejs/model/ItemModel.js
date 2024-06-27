import { pool } from '../config/database';

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

module.exports = {
    createItem,
    updateItem,
    deleteItem
};
