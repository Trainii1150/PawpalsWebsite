const { ApolloServer, gql } = require('apollo-server-express');

// สร้าง schema สำหรับ GraphQL
const typeDefs = gql`
  type Query {
    totalCoins: Int
  }
`;

// สร้าง resolver สำหรับ query totalCoins
const resolvers = {
  Query: {
    totalCoins: async () => {
      try {
        const result = await pool.query('SELECT SUM(Coins) AS TotalCoins FROM ActivityCoding');
        return result.rows[0].TotalCoins;
      } catch (error) {
        console.error(error);
        throw new Error('Error getting coins from database');
      }
    },
  },
};

// สร้าง Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

const express = require('express');
const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
);