const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ApolloServer, gql } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const { pool } = require("./config/database");
const { AuthToken, refreshToken } = require("./middleware/authmid");
const UserRoutes = require("./routes/Userroutes");
const adminRoutes = require("./routes/Adminroutes");
const AuthRoutes = require("./routes/AuthRoutes");
const UserController = require("./controller/UserController");
const UserModel = require("./model/Usermodel");
const StoreModel = require("./model/StoreModel");
const RewardProgressModel = require("./model/rewardProgressModel");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/admin", adminRoutes);

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
    code_references: String
    paste_count: Int
    project_name: String
    file_name: String
  }

  type ActivityReport {
    report_id: ID!
    user_id: ID!
    report_name: String!
    selected_files: [String!]!
    total_time: [Float]
    word_count: [Int]
    coins_earned: [Float]
    timestamp: [String]
    code_references: [String]
    paste_count: [Int]
    start_date: [String]
    end_date: [String]
    created_at: String
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
    item_type: String
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

  type UserSettings {
    user_id: ID
    selected_pet_id: Int
  }

  type ReportSN {
    id: ID!
    user_id: ID!
    report_id: String!
    created_at: String!
  }

  type MutationResponse {
    success: Boolean!
    message: String!
    reportId: ID
  }

  input ReportInput {
    reportId: ID!
    name: String!
    selectedFiles: [String!]!
    totalTime: [Float]
    wordCount: [Int]
    coinsEarned: [Float]
    timestamp: [String]
    codeReferences: [String]
    pasteCount: [Int]
    startDate: [String]
    endDate: [String]
  }
  type Item { 
    item_id: Int
    item_name: String
  }
  type Mutation {
    setSelectedPet(uid: ID!, pet_id: Int!): MutationResponse
    createReportSN(input: ReportInput!): MutationResponse
    deleteOldSNRecords: MutationResponse
    saveActivityReport(uid: ID!, reportData: ReportInput!): MutationResponse
    resetProgress(userId: ID!): MutationResponse
    randomizeItem(userId: ID!): Item
  }



  type Query {
    activity(uid: ID!): [CodingActivity]
    time(uid: String!): Float
    storeItems: [StoreItem]
    userCoins(uid: String!): UserCoins
    userStorageItems(uid: ID!): [UserStorageItem]
    timeByLanguage(uid: String!): [TimeByLanguage]
    userPets(uid: String!): [Pet]
    getProgress(userId: ID!): Progress
    getUserDecorationItems(uid: ID!): UserDecorationItems
    filesByProject(projectName: String!, userId: ID!): [String]
    getUserSettings(uid: ID!): UserSettings
    getReportById(reportId: ID!): ActivityReport
    
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
    getProgress: async (_, { userId }) => {
      const progressData = await RewardProgressModel.getProgressByUser(userId);
      return {
        progress: progressData.progress,
        item_path: progressData.item_path,
      };
    },
    timeByLanguage: async (_, { uid }) => {
      return UserModel.getTimeByLanguage(uid);
    },
    filesByProject: async (_, { projectName, userId }) => {
      return UserModel.getFilesByProjectName(projectName, userId);
    },
    getUserSettings: async (_, { uid }) => {
      return UserModel.getUserSettings(uid);
    },
    userPets: async (_, { uid }) => {
      try {
        const pets = await UserModel.getUserPets(uid);
        return pets;
      } catch (error) {
        console.error("Error in resolver:", error);
        throw new ApolloError("Failed to fetch user pets");
      }
    },
    getUserDecorationItems: async (_, { uid }) => {
      const pets = await UserModel.getUserPets(uid);
      const backgrounds = await UserModel.getUserBackgrounds(uid);
      return {
        pets,
        backgrounds,
      };
    },
    getReportById: async (_, { reportId }) => {
      try {
        return await UserModel.getReportById(reportId);
      } catch (error) {
        console.error("Error fetching report:", error);
        throw new Error("Failed to fetch report");
      }
    },
  },
  Mutation: {
    setSelectedPet: async (_, { uid, pet_id }) => {
      try {
        await UserModel.setSelectedPet(uid, pet_id); // ฟังก์ชันใน UserModel สำหรับการอัปเดตฐานข้อมูล
        return { success: true, message: "Pet selected successfully" };
      } catch (error) {
        console.error("Error setting selected pet:", error);
        throw new ApolloError("Failed to set selected pet");
      }
    },
    resetProgress: async (_, { userId }) => {
      try {
        await RewardProgressModel.resetProgress(userId);
        return { success: true, message: "Progress reset successfully" };
      } catch (error) {
        console.error("Error resetting progress:", error);
        return { success: false, message: "Failed to reset progress." };
      }
    },
    randomizeItem: async (_, { userId }) => {
      try {
        // เรียกใช้ updateUserProgress เพื่อสุ่ม item และอัปเดต progress
        const newItem = await RewardProgressModel.updateUserProgress(userId);
        
        return newItem;
      } catch (error) {
        console.error("Error randomizing item:", error);
        throw new Error("Failed to randomize item.");
      }
    },
    saveActivityReport: async (_, { uid, reportData }) => {
      try {
        const {
          reportId = uuidv4(),
          name,
          selectedFiles,
          totalTime,
          wordCount,
          coinsEarned,
          timestamp,
          codeReferences,
          pasteCount,
          startDate, // รับ startDate
          endDate, // รับ endDate
        } = reportData;

        await UserModel.saveActivityReport(uid, {
          reportId,
          name,
          selectedFiles,
          totalTime,
          wordCount,
          coinsEarned,
          timestamp,
          codeReferences,
          pasteCount,
          startDate, // ส่งค่า startDate ไปที่ UserModel
          endDate, // ส่งค่า endDate ไปที่ UserModel
        });

        return {
          success: true,
          message: "Activity report saved successfully!",
          reportId,
        };
      } catch (error) {
        console.error("Error saving activity report:", error);
        return { success: false, message: "Failed to save activity report." };
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
  console.error("Error starting the server:", error);
});
