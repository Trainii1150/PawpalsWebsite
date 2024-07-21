const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const authUser = require('./routes/Userroutes');
const { pool } = require('./config/database');
const { AuthToken, refreshToken } = require('./middleware/authmid');
const TokenRoutes = require('./routes/TokenRoutes');
const adminRoutes = require('./routes/Adminroutes');
const UserController = require('./controller/UserController');
const UserModel = require('./model/UserModel');
const StoreModel = require('./model/StoreModel');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/user', TokenRoutes);
app.use('/api/user', authUser);

const typeDefs = gql`
  type TimeByLanguage {
    language: String
    total_time: Float
  }

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
    quantity: Int
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
  type Pet {
    pet_id: Int
    pet_name: String
    hunger_level: Int
    last_fed: String
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
    timeByLanguage(uid: String!): [TimeByLanguage]
    userPet(uid: String!): Pet
  }
`;

const resolvers = {
  Query: {
    userCoins: async (_, { uid }) => {
      return UserModel.getUserCoins(uid);
    },
    activity: async (_, { uid }) => {
      return UserModel.getUserActivity(uid);
    },
    time: async (_, { uid }) => {
      return UserModel.getUserActivityTime(uid);
    },
    storeItems: async () => {
      return StoreModel.getStoreItems();
    },
    userStorageItems: async (_, { uid }) => {
      return UserModel.getUserStorageItems(uid);
    },
    timeByLanguage: async (_, { uid }) => {
      return UserModel.getTimeByLanguage(uid);
    },
    userPet: async (_, { uid }) => {
      return UserModel.getUserPet(uid);
    }
  },
};

const SECRET_KEY = process.env.Accesstoken;

app.post('/generate-token', (req, res) => {
  const user = req.body;
  const payload = {
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + (5 * 60)
  };

  const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });

  res.json({ token });
});

app.post('/save-token', (req, res) => {
  const { token } = req.body;
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
app.post('/api/feed-pet', AuthToken, UserController.feedPet);

app.post('/api/randomize-pet', AuthToken, UserController.randomizePet);

app.post('/api/update-user-coins', AuthToken, async (req, res) => {
  const { uid } = req.body;

  try {
    await UserModel.updateUserCoins(uid);
    res.status(200).json({ message: 'User coins updated successfully' });
  } catch (error) {
    console.error('Error updating user coins:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/buy-item', AuthToken, UserController.buyItem);

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

app.use('/api/admin', adminRoutes);
app.use('/graphql', AuthToken);

startServer().catch((error) => {
  console.error('Error starting the server:', error);
});
