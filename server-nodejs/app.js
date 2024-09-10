const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { gql } = require('apollo-server-express');
const UserModel = require('./model/UserModel');
const StoreModel = require('./model/StoreModel');
const RewardProgressModel = require('./model/rewardProgressModel');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// GraphQL Schema Definitions
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
    buyItem(userId: ID!, itemId: Int!): MutationResponse
    updateTimeByLanguage(userId: ID!, language: String!, total_time: Float!): [TimeByLanguage]
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    userCoins: async (_, { uid }) => UserModel.getUserCoins(uid),
    activity: async (_, { uid }) => UserModel.getUserActivity(uid),
    time: async (_, { uid }) => UserModel.getUserActivityTime(uid),
    storeItems: async () => StoreModel.getStoreItems(),
    userStorageItems: async (_, { uid }) => UserModel.getUserStorageItems(uid),
    timeByLanguage: async (_, { uid }) => UserModel.getTimeByLanguage(uid),
    userPets: async (_, { uid }) => {
      try {
        const pets = await UserModel.getUserPets(uid);
        return pets;
      } catch (error) {
        console.error('Error in resolver:', error);
        throw new ApolloError('Failed to fetch user pets');
      }
    },
    getProgress: async (_, { userId }) => RewardProgressModel.getProgressByUser(userId),
    getUserDecorationItems: async (_, { uid }) => {
      const pets = await UserModel.getUserPets(uid);
      const backgrounds = await UserModel.getUserBackgrounds(uid);
      return { pets, backgrounds };
    }
  },
  Mutation: {
    updateTimeByLanguage: async (_, { userId, language, total_time }) => {
      const updatedTimeByLanguage = await UserModel.updateTimeByLanguage(userId, language, total_time);
      return updatedTimeByLanguage;
    },
  }
};

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const apolloServer = new ApolloServer({
    schema,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  // Create HTTP server
  const httpServer = http.createServer(app);

  // Start the server
  httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}${apolloServer.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('Error starting the server:', error);
});
