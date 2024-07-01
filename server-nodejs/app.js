const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const itemRoutes = require('./routes/itemRoutes');
const petRoutes = require('./routes/petRoutes');
const authUser = require('./routes/Userroutes'); // Assuming you have this file
const authrefresh = require('./routes/TokenRoutes');
const { pool } = require('./config/database'); // import pool from configuration database
const AuthMiddleware = require('./middleware/authmid');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/items',itemRoutes);
app.use('/api/pets',petRoutes);

app.use('/api/user', authUser);
app.use('/api/user',authrefresh);

const typeDefs = gql`
  type Query {
    totalCoins: Float,
    totalTime: Int,
    Languages: String,
    extensionToken(uid: String!): String
    coins(uid: String!): Float
    time(uid: String!): Float
  }
`;

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
    totalTime: async () => {
      try {
        const result = await pool.query('SELECT SUM(time::FLOAT) AS total_time FROM "coding_activity"');
        return result.rows[0].total_time || 0;
      } catch (error) {
        console.error(error);
        throw new Error('Error getting time from database');
      }
    },
    Languages: async () => {
      try {
        const result = await pool.query('SELECT * FROM "coding_activity"');
        return result.rows[0].languages;
      } catch (error) {
        console.error(error);
        throw new Error('Error getting languages from database');
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
    },
    time: async (_, { uid }) => {
      try {
        const result = await pool.query('SELECT SUM(time::FLOAT) AS total_time FROM "coding_activity" WHERE user_id = $1', [uid]);
        if (result.rows.length > 0) {
          return result.rows[0].total_time || 0;
        } else {
          return 0;
        }
      } catch (error) {
        console.error(error);
        throw new Error('Error getting time from database');
      }
    },
  },
};



const SECRET_KEY = process.env.Accesstoken;

app.post('/generate-token', (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const payload = {
    uid: uid,
    exp: Math.floor(Date.now() / 1000) + (5 * 60)
  };

  const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });
  res.json({ token });
});

app.post('/save-token', async (req, res) => {
  const { token } = req.body;
  const query = 'INSERT INTO extension_used (extensions_token) VALUES ($1)';

  try {
    await pool.query(query, [token]);
    res.status(200).json({ message: 'Token saved successfully' });
  } catch (err) {
    console.error('Error saving token:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ตรวจสอบ Authorization header และถ้าไม่มีให้ throw error ออกไป
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    context: ({ req }) => {
      const token = req.headers.authorization || ''; // สามารถใช้งาน req.cookies.extensionToken ในกรณีที่มีการส่ง cookie มาใน request
      return { extensionToken: token.replace('Bearer ', '') };
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


// JWT authentication middleware
/*const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || '';
  if (token) {
    jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: 'No token provided' });
  }
};*/