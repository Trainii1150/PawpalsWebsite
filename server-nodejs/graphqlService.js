// graphqlService.js
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
const { gql } = require('apollo-server-express');
const pubsub = require('./pubsub');
const UserModel = require('./model/UserModel');
const StoreModel = require('./model/StoreModel');
const ItemStorageModel = require('./model/ItemstorageModel');
const PetModel = require('./model/PetModel');

// GraphQL typeDefs and resolvers
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
    feedPet(userId: ID!, petId: Int!, foodValue: Int!, itemId: Int!): Pet
    triggerTestEvent: MutationResponse
  }

  type Subscription {
    timeByLanguageUpdated: [TimeByLanguage]
    petFed: Pet  
    testEvent: TestEvent
  }

  type TestEvent {
    message: String!
  }
`;

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
        throw new Error('Failed to fetch user pets');
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
    feedPet: async (_, { userId, petId, foodValue, itemId }) => {
      try {
        console.log('UserId:', userId, 'PetId:', petId, 'FoodValue:', foodValue, 'ItemId:', itemId);
        const foodItem = await ItemStorageModel.getFoodItem(userId, foodValue);
        console.log('Food Item:', foodItem);
        if (!foodItem || foodItem.quantity === 0) {
          throw new Error('Food item not found or quantity is zero');
        }
        await PetModel.updateHungerLevel(petId, foodValue);
        console.log('Hunger level updated for PetId:', petId);
        const newQuantity = foodItem.quantity - 1;
        await ItemStorageModel.updateFoodQuantity(foodItem.storage_id, newQuantity);
        console.log('Food quantity updated. New quantity:', newQuantity);
        if (newQuantity === 0) {
          await ItemStorageModel.deleteFoodItem(foodItem.storage_id);
          console.log('Food item deleted from storage.');
        }
        const updatedPet = await UserModel.getUserPets(userId);
        console.log('Updated Pet:', updatedPet);
        console.log('Publishing petFed event...');
        pubsub.publish('PET_FED', { 
          petFed: {
            pet_id: petId,
            hunger_level: updatedPet.hunger_level,
          }
        });
        console.log('Event published.');
        return {
          pet_id: petId,
          hunger_level: updatedPet.hunger_level
        };
      } catch (error) {
        console.error('Failed to feed pet:', error.message);
        throw new Error('Failed to feed pet: ' + error.message);
      }
    },
  },
  Subscription: {
    petFed: {
        subscribe: () => {
            console.log('Subscription for petFed started - Status: Listening');
            const iterator = pubsub.asyncIterator(['PET_FED']);
            console.log('AsyncIterator:', iterator);
            return iterator;
        },
    },
  }
};

async function startGraphQLServer(app, port) {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const apolloServer = new ApolloServer({
    schema,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  useServer({ schema }, wsServer);

  httpServer.listen(port, () => {
    console.log(`GraphQL Server is running on http://localhost:${port}${apolloServer.graphqlPath}`);
  });
}

module.exports = startGraphQLServer;
