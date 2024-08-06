const pool = require('../config/database');

const createUserPet = async (userId, petId, petName, path) => {
    try {
        const result = await pool.query(
            'INSERT INTO user_pets (user_id, pet_id, pet_name, hunger_level, last_fed, path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, petId, petName, 100, new Date(), path]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user pet:', error);
        throw new Error('Error creating user pet');
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

const updateUserPetExp = async (userId, exp) => {
    try {
        const result = await pool.query(
            'UPDATE user_pets SET exp = exp + $2 WHERE user_id = $1 RETURNING *',
            [userId, exp]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating user pet exp:', error);
        throw new Error('Error updating user pet exp');
    }
};

module.exports = {
    createUserPet,
    updateUserPet,
    deleteUserPet,
    deleteUserPetbyUserid,
    updateUserPetExp,
};