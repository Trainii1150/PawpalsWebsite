const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const authUser = require('./routes/Userroutes'); // Assuming you have this file
const { pool } = require('./model/Usermodel'); // import pool จาก Usermodel
const { AuthToken, refreshToken } = require('./middleware/authmid'); // Import the middleware functions
const TokenRoutes = require('./routes/TokenRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { buyItem, updateUserCoins } = require('./model/ItemModel'); // Import buyItem and updateUserCoins functions

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/user', TokenRoutes);
app.use('/api/user', authUser);

// สร้าง schema สำหรับ GraphQL
const typeDefs = gql`
  type CodingActivity {
    Languages: String
    wordcount: Int
    coins: Float
    time: Float
    Timestamp: String
  }
  type UserStorageItem {
    storage_id: Int
    item_id: Int
    item_name: String
    description: String
    path: String
    food_value: Int
    created_at: String
  }

  type StoreItem {
    store_item_id: Int
    item_id: Int
    item_name: String
    description: String
    path: String
    price: Float
    food_value: Int
    created_at: String
  }

 type UserCoins {
    coins: Float
  }

  type Query {
    activity(uid: ID!): [CodingActivity]
    time(uid: String!): Float
    storeItems: [StoreItem]
    userCoins(uid: String!): UserCoins
    userStorageItems(uid: ID!): [UserStorageItem]
  }
`;

// สร้าง resolver สำหรับ query totalCoins และ activity
const resolvers = {
  Query: {
    userCoins: async (_, { uid }) => {
      try {
        const result = await pool.query(`
          SELECT coins
          FROM public.user_coins
          WHERE user_id = $1
        `, [uid]);

        if (result.rows.length > 0) {
          return { coins: parseFloat(result.rows[0].coins) }; // Return as Float
        } else {
          // If no record exists in user_coins, create a new one with coins from coding_activity
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

          return { coins: parseFloat(total_coins) }; // Return as Float
        }
      } catch (error) {
        console.error(error);
        throw new Error('Error getting user coins from database');
      }
    },

    activity: async (_, { uid }) => {
      try {
        const result = await pool.query(`
          SELECT "Languages", wordcount, coins, time, "Timestamp"
          FROM "coding_activity"
          WHERE user_id = $1
          ORDER BY "Timestamp" DESC
        `, [uid]);

        return result.rows.map(row => ({
          Languages: row.Languages,
          wordcount: row.wordcount,
          coins: row.coins,
          time: row.time,
          Timestamp: row.Timestamp.toISOString(), // Convert Timestamp to string format
        }));
      } catch (error) {
        console.error(error);
        throw new Error('Error getting activity data from database');
      }
    },
    time: async (_, { uid }) => {
      try {
        const result = await pool.query('SELECT SUM(time::FLOAT) AS total_time FROM "coding_activity" WHERE user_id = $1', [uid]);
        if (result.rows.length > 0) {
          return result.rows[0].total_time || 0;
        } else {
          return 0; // Return 0 if no rows found
        }
      } catch (error) {
        console.error(error);
        throw new Error('Error getting time from database');
      }
    },
    storeItems: async () => {
      try {
        const result = await pool.query(`
          SELECT si.store_item_id, si.item_id, si.price, si.created_at,
                 i.item_name, i.description, i.path, i.food_value
          FROM public.store_items si
          JOIN public.items i ON si.item_id = i.item_id
        `);

        return result.rows.map(row => ({
          store_item_id: row.store_item_id,
          item_id: row.item_id,
          item_name: row.item_name,
          description: row.description,
          path: row.path,
          price: row.price,
          food_value: row.food_value,
          created_at: row.created_at.toISOString(), // Convert Timestamp to string format
        }));
      } catch (error) {
        console.error(error);
        throw new Error('Error getting store items from database');
      }
    },
    userStorageItems: async (_, { uid }) => {
      try {
        const result = await pool.query(`
          SELECT us.storage_id, us.item_id, us.created_at,
                 i.item_name, i.description, i.path, i.food_value
          FROM public.user_storage us
          JOIN public.items i ON us.item_id = i.item_id
          WHERE us.user_id = $1
        `, [uid]);

        return result.rows.map(row => ({
          storage_id: row.storage_id,
          item_id: row.item_id,
          item_name: row.item_name,
          description: row.description,
          path: row.path,
          food_value: row.food_value,
          created_at: row.created_at.toISOString(), // Convert Timestamp to string format
        }));
      } catch (error) {
        console.error(error);
        throw new Error('Error getting user storage items from database');
      }
    }
  },
};

const SECRET_KEY = process.env.Accesstoken;

app.post('/generate-token', (req, res) => {
  const user = req.body; // Assuming user information is sent in the request body
  const payload = {
    username: user.username, // ข้อมูลที่ต้องการใส่ใน payload ของ token
    exp: Math.floor(Date.now() / 1000) + (5 * 60) // กำหนดเวลาหมดอายุ 5 นาที
  };

  const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });

  res.json({ token });
});

app.post('/save-token', (req, res) => {
  const { token } = req.body; // รับ token ที่ส่งมาจากแอปพลิเคชัน Angular
  const query = 'INSERT INTO token_used (extensions_token) VALUES ($1)';

  pool.query(query, [token], (err, result) => {
    if (err) {
      console.error('Error saving token:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Token saved successfully:', token);
      res.status(200).json({ message: 'Token saved successfully' });
    }
  });
});

app.post('/api/update-user-coins', AuthToken, async (req, res) => {
  const { uid } = req.body;

  try {
    await updateUserCoins(uid);
    res.status(200).json({ message: 'User coins updated successfully' });
  } catch (error) {
    console.error('Error updating user coins:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/buy-item', AuthToken, async (req, res) => {
  const { uid, item_id } = req.body;

  console.log('Buying item:', { uid, item_id }); // บันทึกค่าที่รับเข้ามา

  if (!item_id) {
    console.error('Error: item_id is undefined');
    return res.status(400).json({ error: 'Item ID is required' });
  }

  try {
    const result = await buyItem(uid, item_id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error buying item:', error.message);
    res.status(500).json({ error: error.message });
  }
});




async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Use the adminRoutes
app.use('/api/admin', adminRoutes);
// Apply AuthMiddleware to /graphql route
app.use('/graphql', AuthToken);

startServer().catch((error) => {
  console.error('Error starting the server:', error);
});
