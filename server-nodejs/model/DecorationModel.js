const pool = require('../config/database');

const createUserDecoration = async (userId, decoration) => {
  try {
    const result = await pool.query(
      'INSERT INTO user_decorations (user_id, pet_path, background_path, long_programming_effect_path, error_effect_path) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, decoration.pet, decoration.background, null, null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user decoration:', error);
    throw error;
  }
};

const updateUserDecoration = async (userId, decoration) => {
  try {
    const result = await pool.query(
      'UPDATE user_decorations SET pet_path = $2, background_path = $3, long_programming_effect_path = $4, error_effect_path = $5 WHERE user_id = $1 RETURNING *',
      [userId, decoration.pet, decoration.background, null, null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user decoration:', error);
    throw error;
  }
};

const getUserDecoration = async (userId) => {
  try {
    const result = await pool.query('SELECT * FROM user_decorations WHERE user_id = $1', [userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user decoration:', error);
    throw error;
  }
};

module.exports = {
  createUserDecoration,
  updateUserDecoration,
  getUserDecoration,
};
