// src/server.ts

import http from "http";
import app from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { connectDB, disconnectDB } from "./db/mongo.js";

const PORT = config.port;
const httpServer = http.createServer(app);

let isShuttingDown = false;

/**
 * Starts the application server after establishing a database connection.
 */
async function startServer() {
  try {
    // ✅ FIXED: Connect to the database before starting the server
    await connectDB();

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.fatal(
      { err: error },
      "❌ Failed to start server due to an error during initialization."
    );
    process.exit(1);
  }
}

/**
 * Handles the graceful shutdown of the server and its resources.
 * @param signalSource The signal or event that triggered the shutdown.
 */
const performGracefulShutdown = async (signalSource: string) => {
  if (isShuttingDown) {
    logger.warn(
      `[Shutdown] Already in progress (triggered by ${signalSource})...`
    );
    return;
  }
  isShuttingDown = true;
  logger.info(`👋 Received ${signalSource}, shutting down gracefully...`);

  // Force exit after a timeout to prevent hanging
  const shutdownTimeout = setTimeout(() => {
    logger.error("⚠️ Graceful shutdown timed out (10s), forcing exit.");
    process.exit(1);
  }, 10000);

  try {
    // Close the main HTTP server
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => {
        if (err) return reject(err);
        logger.info("✅ HTTP server closed.");
        resolve();
      });
    });

    // ✅ FIXED: Disconnect from the database
    await disconnectDB();

    clearTimeout(shutdownTimeout);
    logger.info("🚪 All services closed successfully. Exiting process...");
    process.exit(0);
  } catch (error: any) {
    clearTimeout(shutdownTimeout);
    logger.fatal({ err: error }, "❌ Error during graceful shutdown sequence");
    process.exit(1);
  }
};

/**
 * Handles critical, unrecoverable errors by initiating a graceful shutdown.
 * @param errorType A string describing the type of error.
 * @param error The actual error object.
 */
const criticalErrorHandler = (errorType: string, error: Error | any) => {
  logger.fatal(
    { err: error },
    `💥 ${errorType}! Attempting graceful shutdown...`
  );

  if (!isShuttingDown) {
    performGracefulShutdown(errorType);
  }
};

// --- Process Signal and Error Handling ---
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, () => performGracefulShutdown(signal));
});

process.on("unhandledRejection", (reason) => {
  criticalErrorHandler("UNHANDLED REJECTION", reason);
});

process.on("uncaughtException", (err) => {
  criticalErrorHandler("UNCAUGHT EXCEPTION", err);
});

// Finally, start the server
startServer();
