const pool = require('../config/database'); // Use require instead of import

const createPet = async (pet_name, description, pet_type) => {
   try {
        const result = await pool.query(
            'INSERT INTO pets (pet_name, description, pet_type, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [pet_name, description, pet_type]
        );
        return result.rows[0];
   } catch (error) {
        console.error(error);
   }
};

const updatePet = async (pets_id, pet_name, description, pet_type) => {
    try {
        const result = await pool.query(
            'UPDATE pets SET pet_name = $1, description = $2, pet_type = $3 WHERE pet_id = $4 RETURNING *',
            [pet_name, description, pet_type, pets_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
    
};

const deletePet = async (pets_id) => {
    try {
        const result = await pool.query(
            'DELETE FROM pets WHERE pet_id = $1', 
            [pets_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    createPet,
    updatePet,
    deletePet
};
