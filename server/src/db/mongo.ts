//src/db/mongo.ts
import mongoose from "mongoose";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

mongoose.connection.on("connected", () => {
  logger.info("✅ Mongoose connected successfully to MongoDB.");
});

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "❌ Mongoose connection error!");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("🔌 Mongoose disconnected.");
});

// These two models are in the local 'models' folder
export { default as User } from "./models/user.model.js";
export { default as RefreshToken } from "./models/refreshToken.model.js";

export { default as Event } from "../features/event/event.model.js";
export { default as EventCategory } from "../features/eventCategory/eventCategory.model.js";
export { default as Comment } from "../features/comment/comment.model.js";
export { default as CheckIn } from "../features/checkIn/checkIn.model.js";
export { default as SavedEvent } from "../features/savedEvent/savedEvent.model.js";
export { default as VerificationRequest } from "../features/verificationRequest/verificationRequest.model.js";

const connectDB = async () => {
  try {
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
