import { pool } from '../config/database';

const createPet = async (pet_name, description, pet_type) => {
    const result = await pool.query(
        'INSERT INTO pets (pet_name, description, pet_type, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [pet_name, description, pet_type]
    );
    return result.rows[0];
};

const updatePet = async (pets_id, pet_name, description, pet_type) => {
    const result = await pool.query(
        'UPDATE pets SET pet_name = $1, description = $2, pet_type = $3 WHERE pet_id = $4 RETURNING *',
        [pet_name, description, pet_type, pets_id]
    );
    return result.rows[0];
};

const deletePet = async (pets_id) => {
    await pool.query('DELETE FROM pets WHERE pet_id = $1', [pets_id]);
};

module.exports = {
    createPet,
    updatePet,
    deletePet
};
