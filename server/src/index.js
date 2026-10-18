const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const configureApp = require("./settings/config.js");
const seedAdmin = require("./seeders/seedAdmin.js");
const { getPrisma, testConnection, disconnectPrisma } = require("./db/prisma.js");

// Set default environment
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
const port = parseInt(process.env.PORT, 10) || 3001;

// Parsing request body
app.use(express.json());
configureApp(app);

global.__DB_STATUS__ = {
  hasDbUrl: false,
  provider: "postgresql (supabase)",
  projectId: process.env.SUPABASE_PROJECT_ID || "uzgklxytaixdousaxhtb",
  region: process.env.SUPABASE_REGION || "ap-northeast-1",
  lastError: null,
  connectedAt: null,
  attempts: 0,
};

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return true;

  const rawDbUrl = (process.env.DATABASE_URL || "").trim();
  global.__DB_STATUS__.hasDbUrl = Boolean(rawDbUrl);
  global.__DB_STATUS__.attempts += 1;

  if (!rawDbUrl || rawDbUrl.includes("YOUR-PASSWORD") || rawDbUrl.includes("[password]")) {
    const hint =
      "Supabase PostgreSQL connection string not fully configured. Please ensure DATABASE_URL in .env contains your Supabase database password.";
    global.__DB_STATUS__.lastError = hint;
    console.warn(`[Supabase / Postgres] ⚠ ${hint}`);
    return false;
  }

  console.log("Connecting to Supabase PostgreSQL database...");
  const check = await testConnection();

  if (check.connected) {
    isConnected = true;
    global.__DB_STATUS__.connectedAt = new Date().toISOString();
    global.__DB_STATUS__.lastError = null;
    console.log("[Supabase / Postgres] Connected successfully to PostgreSQL database.");

    // Seed default admin account
    try {
      await seedAdmin();
    } catch (seedErr) {
      console.warn("Notice during admin seeding:", seedErr.message);
    }

    return true;
  } else {
    global.__DB_STATUS__.lastError = check.error;
    console.error("[Supabase / Postgres] Connection check failed:", check.error);
    if (check.error && (check.error.includes("password authentication failed") || check.error.includes("FATAL"))) {
      console.error(
        "-> Supabase Diagnostic: Authentication failed. Please verify your database password in server/.env (DATABASE_URL)."
      );
    }
    return false;
  }
}

global.connectToDatabase = connectToDatabase;

async function bootstrap() {
  try {
    await connectToDatabase();

    const server = app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });

    // Graceful shutdown
    const handleShutdown = async () => {
      console.log("Shutting down gracefully...");
      await disconnectPrisma();
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
  } catch (error) {
    console.error("Bootstrap error:", error);
    app.listen(port, () => {
      console.log(`App listening on port ${port} (fallback)`);
    });
  }
}

bootstrap();
