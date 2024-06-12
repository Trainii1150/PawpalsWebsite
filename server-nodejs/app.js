const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const authUser = require('./routes/Userroutes'); // Assuming you have this file
const { pool } = require('./model/Usermodel'); // import pool จาก Usermodel
const AuthMiddleware = require('./middleware/authmid');

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
    extensionToken(email: String!): String
    coins(extensionToken: String!): Float
  }
`;

// สร้าง resolver สำหรับ query totalCoins
const resolvers = {
  Query: {
    totalCoins: async () => {
      try {
        const result = await pool.query('SELECT SUM(coins::Float) AS total_coins FROM ActivityCoding');
        return result.rows[0].total_coins; // ตรวจสอบว่าคีย์ตรงกับชื่อคอลัมน์ในฐานข้อมูล
      } catch (error) {
        console.error(error);
        throw new Error('Error getting coins from database');
      }
    },
    Languages: async () => {
      try {
        const result = await pool.query('SELECT * FROM ActivityCoding ');
        return result.rows[0].Languages; // ตรวจสอบว่าคีย์ตรงกับชื่อคอลัมน์ในฐานข้อมูล
      } catch (error) {
        console.error(error);
        throw new Error('Error getting languages from database');
      }
    },
    extensionToken: async (_, { email }) => {
      try {
        const result = await pool.query('SELECT extensions_token FROM token_used WHERE email = $1', [email]);
        if (result.rows.length > 0) {
          return result.rows[0].extensions_token;
        } else {
          throw new Error('Extension token not found');
        }
      } catch (error) {
        console.error(error);
        throw new Error('Error getting extension token from database');
      }
    },
    coins: async (_, { extensionToken }) => {
      try {
        const result = await pool.query('SELECT SUM(coins::Float) AS total_coins FROM ActivityCoding WHERE extensions_token = $1', [extensionToken]);
        if (result.rows.length > 0) {
          return result.rows[0].total_coins;
        } else {
          throw new Error('Coins not found for this token');
        }
      } catch (error) {
        console.error(error);
        throw new Error('Error getting coins from database');
      }
    },
  },
};

const SECRET_KEY = process.env.Accesstoken;

app.post('/generate-token', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const payload = {
    email: email,
    exp: Math.floor(Date.now() / 1000) + (5 * 60) // กำหนดเวลาหมดอายุ 5 นาที
  };

  const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });
  res.json({ token });
});

app.post('/save-token', async (req, res) => {
  const { token } = req.body; // รับ token ที่ส่งมาจากแอปพลิเคชัน Angular
  const query = 'INSERT INTO token_used (extensions_token) VALUES ($1)';

  try {
    await pool.query(query, [token]);
    res.status(200).json({ message: 'Token saved successfully' });
  } catch (err) {
    console.error('Error saving token:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware to handle JWT authentication
// Keep later use to verify to query data from graphql server
/*const verifytoken = (req, res, next) => {
  const token = req.headers.authorization || '';
  if (token) {
    jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, decoded) => {
      if (err) {
        // Token expired or invalid
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = decoded;
      next();
    });
  } else {
    // No token provided
    res.status(401).json({ error: 'No token provided' });
  }
};*/

async function startServer() {
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      if (!token) throw new Error('No token provided');
      const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
      return { user: decoded.email };
    },
  });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}


startServer().catch((error) => {
  console.error('Error starting the server:', error);
});
