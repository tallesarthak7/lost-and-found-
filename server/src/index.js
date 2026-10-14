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

async function bootstrap() {
  try {
    let dbUrl = process.env.DATABASE_URL;
    const dbName = process.env.DATABASE_NAME || "campus_lf";

    if (!dbUrl) {
      console.log("No external DATABASE_URL found. Initializing local persistent MongoDB instance...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const dbPath = path.resolve(__dirname, "../.mongo-data");
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: "wiredTiger",
        },
      });
      dbUrl = mongod.getUri();
      console.log(`Embedded MongoDB instance active at: ${dbUrl}`);
    }

    await mongoose.connect(dbUrl, { dbName });
    console.log("Connected To MongoDB");

    // Seed default admin account if not already created
    await seedAdmin();

    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.error("Bootstrap error:", error);
    process.exit(1);
  }
}

bootstrap();
