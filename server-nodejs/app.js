const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const authUser = require('./routes/Userroutes'); // Assuming you have this file
const { pool } = require('./model/Usermodel'); // import pool จาก Usermodel

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
    Languages: String
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
    },
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
