const pool = require('../config/database'); // Use require instead of import

const createPet = async (pet_name, description, pet_type, pet_path) => {
   try {
        const result = await pool.query(
            'INSERT INTO pets (pet_name, description, pet_type, path ,created_at) VALUES ($1, $2, $3, $4,NOW()) RETURNING *',
            [pet_name, description, pet_type, pet_path]
        );
        return result.rows[0];
   } catch (error) {
        console.error(error);
   }
};

const getPet = async (pet_id) => {
    try {
      const result = await pool.query(
        'SELECT * FROM pets WHERE pet_id = $1',
        [pet_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting pet:', error);
      throw error;
    }
};

const getAllPets = async () => {
    try {
      const result = await pool.query('SELECT * FROM pets');
      return result.rows;
    } catch (error) {
      console.error('Error getting all pets:', error);
      throw error;
    }
  };

const updatePet = async (petId, petName, description, petType, path) => {
    try {
        const result = await pool.query(
            'UPDATE pets SET pet_name = $1, description = $2, pet_type = $3 , path = $5 WHERE pet_id = $4 RETURNING *',
            [petName, description, petType, petId, path]
        );
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error updating pet');
    }
};

const updatePetWithoutPath = async (petId, petName, description, petType) => {
    try {
        const result = await pool.query(
            'UPDATE pets SET pet_name = $1, description = $2, pet_type = $3 WHERE pet_id = $4 RETURNING *',
            [petName, description, petType, petId]
        );
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error updating pet');
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

const updateHungerLevel = async (uid, foodValue) => {
    try {
        await pool.query(`
            UPDATE public.user_pets
            SET hunger_level = hunger_level + $1, last_fed = NOW()
            WHERE pet_id = $2
        `, [foodValue, uid]);
    } catch (error) {
        console.error('Error updating hunger level:', error);
        throw new Error('Error updating hunger level');
    }
};

module.exports = {
    createPet,
    getPet,
    getAllPets,
    updatePet,
    updatePetWithoutPath,
    deletePet,
    updateHungerLevel,
};
