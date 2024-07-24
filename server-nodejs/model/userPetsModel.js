const pool = require('../config/database');

const createUserPet = async (userId, petId, petName) => {
    try {
        const result = await db.query(
            'INSERT INTO user_pets (user_id, pet_id, pet_name VALUES ($1, $2, $3) RETURNING *',
            [userId, petId, petName]
        );
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
};

const updateUserPet = async (userPetId, petId, petName, hungerLevel) => {
    try {
        const result = await db.query(
            'UPDATE user_pets SET pet_id = $2, pet_name = $3, hunger_level = $4, last_fed = NOW() WHERE user_pet_id = $1 RETURNING *',
            [userPetId, petId, petName, hungerLevel]
        );
        return result.rows[0]; // Return the updated pet details
    } catch (error) {
        console.error(error);
    }
};

const deleteUserPet = async (userPetId, userId, petId) => {
    try {
        const result = await db.query(
            'DELETE FROM user_pets WHERE user_pet_id = $1 AND user_id = $2 AND pet_id = $3 RETURNING *',
            [userPetId, userId, petId]
        );
        return result.rows[0]; // Return the deleted pet's ID if it exists
    } catch (error) {
        console.error(error);
    }
};

const deleteUserPetbyUserid = async (userId) => {
    try {
        const result = await pool.query('DELETE FROM user_pets WHERE user_id = $1 RETURNING *', [userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting user pets by user ID:', error);
        throw error;
    }
};


module.exports = {
    createUserPet,
    updateUserPet,
    deleteUserPet,
    deleteUserPetbyUserid,
};