const pool = require('../config/database');

const createUserPet = async (userId, petId, petName) => {
    try {
        const result = await pool.query(
            'INSERT INTO user_pets (user_id, pet_id, pet_name, hunger_level, last_fed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, petId, petName, 100, new Date()]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user pet:', error);
        throw new Error('Error creating user pet');
    }
};

const updateUserPet = async (userPetId, petId, petName, hungerLevel, path) => {
    try {
        const result = await pool.query(
            'UPDATE user_pets SET pet_id = $2, pet_name = $3, hunger_level = $4, last_fed = NOW(), path = $5 WHERE user_pet_id = $1 RETURNING *',
            [userPetId, petId, petName, hungerLevel, path]
        );
        return result.rows[0]; // Return the updated pet details
    } catch (error) {
        console.error(error);
    }
};

const deleteUserPet = async (userPetId, userId, petId) => {
    try {
        const result = await pool.query(
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
const getAllUserPets = async () => {
    try {
      const result = await pool.query('SELECT * FROM user_pets');
      return result.rows;
    } catch (error) {
      console.error('Error getting all user_pets:', error);
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
        throw new Error('Error updating user pet exp');
    }
};

module.exports = {
    createUserPet,
    updateUserPet,
    deleteUserPet,
    deleteUserPetbyUserid,
    updateUserPetExp,
    getAllUserPets,
};