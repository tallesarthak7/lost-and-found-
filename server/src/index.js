const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const configureApp = require("./settings/config.js");
const seedAdmin = require("./seeders/seedAdmin.js");

// Set the default environment
process.env.NODE_ENV = process.env.NODE_ENV || "development";
console.log(`Current Environment: ${process.env.NODE_ENV}`);

// Load Environment variables from different files based on environment
const envFile = path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`);
if (fs.existsSync(envFile)) {
  console.log(`Loading environment variables from: ${envFile}`);
  dotenv.config({ path: envFile });
} else {
  const fallbackEnv = path.resolve(__dirname, "../.env");
  console.log(`Loading environment variables from fallback: ${fallbackEnv}`);
  dotenv.config({ path: fallbackEnv });
}

const app = express();
const port = parseInt(process.env.PORT) || 3001;

// Parsing request body
app.use(express.json());
configureApp(app);

global.__MONGO_STATUS__ = {
  hasDbUrl: false,
  urlType: "none",
  lastError: null,
  connectedAt: null,
  attempts: 0,
};

function sanitizeMongoUri(uri) {
  if (!uri) return { uri: "" };
  const trimmed = uri.trim();
  const match = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^@\/]+)(\/.*)?$/);
  if (match) {
    const [, proto, user, pass, host, rest] = match;
    if (proto.includes("+srv") && !host.includes(".")) {
      return {
        error: `Invalid MongoDB Atlas URI: host parsed as '${host}'. An Atlas SRV connection string must end with a cluster domain like @cluster0.xxxxx.mongodb.net. If your password contains '@', make sure the full cluster domain follows the password.`,
        uri: trimmed,
      };
    }
    const cleanUser = encodeURIComponent(decodeURIComponent(user));
    const cleanPass = encodeURIComponent(decodeURIComponent(pass));
    return {
      uri: `${proto}${cleanUser}:${cleanPass}@${host}${rest || ""}`,
    };
  }
  return { uri: trimmed };
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return true;

  let rawDbUrl = (process.env.DATABASE_URL || process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
  const sanitized = sanitizeMongoUri(rawDbUrl);
  let dbUrl = sanitized.uri;
  const dbName = (process.env.DATABASE_NAME || "campus_lf").trim();

  global.__MONGO_STATUS__.hasDbUrl = Boolean(rawDbUrl);
  global.__MONGO_STATUS__.urlType = dbUrl.startsWith("mongodb+srv://")
    ? "mongodb+srv"
    : dbUrl.startsWith("mongodb://")
    ? "mongodb"
    : dbUrl
    ? "other"
    : "none";
  global.__MONGO_STATUS__.attempts += 1;

  if (sanitized.error) {
    global.__MONGO_STATUS__.lastError = sanitized.error;
    console.error("-> Atlas Diagnostic:", sanitized.error);
    return false;
  }

  if (!dbUrl) {
    console.log("No external DATABASE_URL provided. Initializing embedded MongoDB instance...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const dbPath = path.resolve(__dirname, "../.mongo-data");
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      let mongod;
      try {
        mongod = await MongoMemoryServer.create({
          instance: {
            dbPath,
            storageEngine: "wiredTiger",
          },
        });
      } catch (wtErr) {
        console.warn("WiredTiger storage failed, trying standard in-memory:", wtErr.message);
        mongod = await MongoMemoryServer.create();
      }
      dbUrl = mongod.getUri();
      console.log(`Embedded MongoDB instance active at: ${dbUrl}`);
    } catch (memErr) {
      console.error("Embedded MongoDB memory server failed to initialize:", memErr.message);
      global.__MONGO_STATUS__.lastError = `Memory server error: ${memErr.message}`;
      return false;
    }
  }

  if (dbUrl) {
    try {
      const isAtlas = dbUrl.startsWith("mongodb+srv://");
      console.log(`Connecting to MongoDB (${isAtlas ? "MongoDB Atlas Cloud Cluster" : "Standard MongoDB URI"})...`);
      await mongoose.connect(dbUrl, { dbName, serverSelectionTimeoutMS: 10000 });
      console.log("Connected To MongoDB");
      global.__MONGO_STATUS__.connectedAt = new Date().toISOString();
      global.__MONGO_STATUS__.lastError = null;

      // Seed default admin account if not already created
      await seedAdmin();
      return true;
    } catch (connErr) {
      global.__MONGO_STATUS__.lastError = connErr.message;
      console.error("MongoDB Connection Error:", connErr.message);
      if (connErr.message.includes("bad auth") || connErr.message.includes("Authentication failed")) {
        console.error("-> Atlas Diagnostic: Authentication failed. Verify your database username and password in DATABASE_URL.");
      } else if (connErr.message.includes("querySrv") || connErr.message.includes("ENOTFOUND")) {
        console.error("-> Atlas Diagnostic: DNS resolution failed. Check your cluster hostname in DATABASE_URL.");
      } else if (connErr.message.includes("buffering timed out") || connErr.message.includes("whitelist") || connErr.message.includes("ETIMEDOUT") || connErr.message.includes("timed out")) {
        console.error("-> Atlas Diagnostic: Connection timed out. Make sure 0.0.0.0/0 (allow from anywhere) is active in MongoDB Atlas Network Access!");
      }
      return false;
    }
  }
  return false;
}

global.connectToDatabase = connectToDatabase;

async function bootstrap() {
  try {
    // Register mongoose connection events for runtime monitoring
    mongoose.connection.on("connected", () => {
      const dbName = (process.env.DATABASE_NAME || "campus_lf").trim();
      global.__MONGO_STATUS__.connectedAt = new Date().toISOString();
      global.__MONGO_STATUS__.lastError = null;
      console.log(`[Database] Mongoose connected successfully to '${mongoose.connection.name || dbName}'`);
    });
    mongoose.connection.on("error", (err) => {
      global.__MONGO_STATUS__.lastError = err.message;
      console.error("[Database] Mongoose connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("[Database] Mongoose disconnected from database");
    });

    await connectToDatabase();

    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.error("Bootstrap error:", error);
    app.listen(port, () => {
      console.log(`App listening on port ${port} (fallback)`);
    });
  }
}

bootstrap();
