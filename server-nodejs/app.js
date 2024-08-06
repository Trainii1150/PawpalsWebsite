const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/database');
const { AuthToken, refreshToken } = require('./middleware/authmid');
const UserRoutes = require('./routes/Userroutes');
const adminRoutes = require('./routes/Adminroutes');
const AuthRoutes = require('./routes/AuthRoutes');
const UserController = require('./controller/UserController');
const UserModel = require('./model/UserModel');
const StoreModel = require('./model/StoreModel');
const RewardProgressModel = require('./model/rewardProgressModel');
const UserDecorationModel = require('./model/DecorationModel');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/admin', adminRoutes);

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
    path: String
    exp: Float
  }

  type UserCoins {
    coins: Float
  }

  type Progress {
    user_id: String
    item_id: Int
    progress: Float
    item_path: String
  }

  type Background {
    item_id: Int
    item_name: String
    path: String
  }

  type UserDecorationItems {
    pets: [Pet]
    backgrounds: [Background]
  }

  input DecorationInput {
    pet_id: Int
    background: String
  }

  type MutationResponse {
    success: Boolean!
  }

  type Query {
    activity(uid: ID!): [CodingActivity]
    time(uid: String!): Float
    storeItems: [StoreItem]
    userCoins(uid: String!): UserCoins
    userStorageItems(uid: ID!): [UserStorageItem]
    timeByLanguage(uid: String!): [TimeByLanguage]
    userPets(uid: String!): [Pet]
    getProgress(userId: ID!): [Progress]
    getUserDecorationItems(uid: ID!): UserDecorationItems
  }

  type Mutation {
    updateProgress(userId: ID!, itemId: Int!, progress: Float!): Progress
    saveUserDecoration(userId: ID!, decoration: DecorationInput!): MutationResponse
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
    userPets: async (_, { uid }) => {
      try {
        const pets = await UserModel.getUserPets(uid);
        console.log('Pets fetched:', pets); // เพิ่มการ debug
        return pets;
      } catch (error) {
        console.error('Error in resolver:', error);
        throw new ApolloError('Failed to fetch user pets');
      }
    },
    getProgress: async (_, { userId }) => {
      return RewardProgressModel.getProgressByUser(userId);
    },
    getUserDecorationItems: async (_, { uid }) => {
      const pets = await UserModel.getUserPets(uid);
      const backgrounds = await UserModel.getUserBackgrounds(uid);
      return {
        pets,
        backgrounds
      };
    },
  },
  
  Mutation: {
    updateProgress: async (_, { userId, itemId, progress }) => {
      const updatedProgress = await RewardProgressModel.createOrUpdateProgress(userId, itemId, progress);
      return updatedProgress;
    },
    saveUserDecoration: async (_, { userId, decoration }) => {
      let existingDecoration = await pool.query('SELECT * FROM user_decorations WHERE user_id = $1', [userId]);
      if (existingDecoration.rows.length > 0) {
        await UserDecorationModel.updateUserDecoration(userId, decoration);
      } else {
        await UserDecorationModel.createUserDecoration(userId, decoration);
      }
      return { success: true };
    }
  }
};

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Error starting the server:', error);
});
