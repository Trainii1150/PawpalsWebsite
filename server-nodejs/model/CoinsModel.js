const pool = require('../config/database');

const getUserCoins = async (uid) => {
  try {
    const result = await pool.query(`
      SELECT coins
      FROM public.user_coins
      WHERE user_id = $1
    `, [uid]);

    if (result.rows.length > 0) {
      return { coins: parseFloat(result.rows[0].coins) };
    } else {
      const coinsResult = await pool.query(`
        SELECT SUM(coins::FLOAT) AS total_coins
        FROM public.coding_activity
        WHERE user_id = $1
      `, [uid]);

      const total_coins = coinsResult.rows[0].total_coins || 0;

      await pool.query(`
        INSERT INTO public.user_coins (user_id, coins)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET coins = $2
      `, [uid, total_coins]);

      return { coins: parseFloat(total_coins) };
    }
  } catch (error) {
    console.error('Error getting user coins from database:', error);
    throw new Error('Error getting user coins from database');
  }
};

const updateUserCoins = async (uid) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT SUM(coins::FLOAT) AS total_coins FROM "coding_activity" WHERE user_id = $1',
      [uid]
    );

    const totalCoins = result.rows[0].total_coins || 0;

    await client.query(
      'INSERT INTO user_coins (user_id, coins) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET coins = EXCLUDED.coins',
      [uid, totalCoins]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deductUserCoins = async (uid, amount) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userCoinsResult = await client.query('SELECT coins FROM user_coins WHERE user_id = $1', [uid]);
    if (userCoinsResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userCoins = userCoinsResult.rows[0].coins;

    if (userCoins < amount) {
      throw new Error('Not enough coins');
    }

    const newCoins = userCoins - amount;
    await client.query('UPDATE user_coins SET coins = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [newCoins, uid]);

    await client.query('COMMIT');
    return newCoins;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const addCoins = async (uid, amount) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userCoinsResult = await client.query('SELECT coins FROM user_coins WHERE user_id = $1', [uid]);
    if (userCoinsResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userCoins = userCoinsResult.rows[0].coins;
    const newCoins = userCoins + amount;
    await client.query('UPDATE user_coins SET coins = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [newCoins, uid]);

    await client.query('COMMIT');
    return newCoins;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteCoins = async (uid) => {
  try {
    const result = await pool.query('DELETE FROM user_coins WHERE user_id = $1 RETURNING *', [uid]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting user coins from database:', error);
    throw new Error('Error deleting user coins from database');
  }
};

module.exports = {
  getUserCoins,
  updateUserCoins,
  deductUserCoins,
  addCoins,
  deleteCoins
};
