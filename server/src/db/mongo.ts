// src/db/mongo.ts

import mongoose from "mongoose";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

// ✅ ADDED: Event listeners for robust connection handling
mongoose.connection.on("connected", () => {
  logger.info("✅ Mongoose connected successfully to MongoDB.");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "❌ Mongoose connection error!");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("🔌 Mongoose disconnected.");
});

// Export your Mongoose models from a single point for easy access
export { default as User } from "./models/user.model.js";
export { default as RefreshToken } from "./models/refreshToken.model.js";

const connectDB = async () => {
  try {
    // The connection attempt is made here. The listeners above will handle the outcome.
    await mongoose.connect(config.databaseUrl);
  } catch (err) {
    logger.fatal({ err }, "❌ Initial Mongoose connection failed!");
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    logger.error({ err }, "❌ Error during Mongoose disconnect.");
  }
};

export { connectDB, disconnectDB };
