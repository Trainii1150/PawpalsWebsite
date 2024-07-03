require('dotenv').config(); // Add this line to load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const authUser = require('./routes/Userroutes'); // Assuming you have this file
const { pool } = require('./model/Usermodel'); // import pool จาก Usermodel
const { AuthToken, refreshToken } = require('./middleware/authmid'); // Import the middleware functions
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/user', authUser);

// สร้าง schema สำหรับ GraphQL
const typeDefs = gql`
  type Query {
    totalCoins: Float,
    Languages: String,
    time(uid: String!): Float,
    coins(uid: String!): Float
  }
`;

// สร้าง resolver สำหรับ query totalCoins
const resolvers = {
  Query: {
    totalCoins: async () => {
      try {
        const result = await pool.query('SELECT SUM(coins::FLOAT) AS total_coins FROM "coding_activity"');
        return result.rows[0].total_coins || 0;
      } catch (error) {
        console.error(error);
        throw new Error('Error getting coins from database');
      }
    },
    Languages: async () => {
      try {
        const result = await pool.query('SELECT * FROM "coding_activity"');
        return result.rows[0].languages; // ตรวจสอบว่าคีย์ตรงกับชื่อคอลัมน์ในฐานข้อมูล
      } catch (error) {
        console.error(error);
        throw new Error('Error getting languages from database');
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
    coins: async (_, { uid }) => {
      try {
        const result = await pool.query('SELECT SUM(coins::FLOAT) AS total_coins FROM "coding_activity" WHERE user_id = $1', [uid]);
        if (result.rows.length > 0) {
          return result.rows[0].total_coins || 0;
        } else {
          throw new Error('Coins not found for this user ID');
        }
      } catch (error) {
        console.error(error);
        throw new Error('Error getting coins from database');
      }
    }
  }
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

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Apply AuthMiddleware to /graphql route
app.use('/graphql', AuthToken);

startServer().catch((error) => {
  console.error('Error starting the server:', error);
});
