const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const authRouter = require("../auth/auth.router.js");
const usersRouter = require("../users/users.router.js");
const itemRouter = require("../items/items.router.js");
const adminRouter = require("../admin/admin.router.js");
const matchRouter = require("../matches/matches.router.js");
const claimRouter = require("../claims/claims.router.js");
const responseFormatter = require("../middleware/responseFormatter.middleware.js");
const { StatusCodes } = require("http-status-codes");
const expressWinstonLogger = require("../middleware/expressWinston.middleware.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger.config.js");
const { testConnection } = require("../db/prisma.js");

function configureApp(app) {

// Use CORS
// Enabled for all origins
//app.use(cors());
// Only requests from example.com
// app.use(cors(corsOptions));

// Using Morgan for logging
/**
 * File System Module (fs): Used to create a writable stream for the file where logs will be saved.
 * Path Module (path): Helps with handling file paths.
 * Create Write Stream: fs.createWriteStream() is used to create a stream that Morgan will write log data to. The 'a' flag ensures that logs are appended to the file (access.log) instead of overwriting it.
 */



// CORS Configuration with Multiple Origins and Regex Support
const allowedOrigins = [
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/, // Any localhost / loopback port (e.g. 5173, 5174, 3000)
  /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/, // Local LAN IPs
  /\.app\.github\.dev$/,    // GitHub Codespaces
  /\.devtunnels\.ms$/,      // VS Code Dev Tunnels
  /\.vercel\.app$/,         // Vercel deployment domains
  /\.onrender\.com$/,       // Render deployment domains
  /\.loca\.lt$/,            // Localtunnel domains
  /\.trycloudflare\.com$/,  // Cloudflare Tunnel domains
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    const isAllowed =
      process.env.NODE_ENV !== "production" ||
      allowedOrigins.some(o =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "bypass-tunnel-reminder",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));



var accessLogStream = fs.createWriteStream(
  //! The 'path.join' method joins all given path segments together using the platform-specific separator
  // '__dirname' is a Node.js variable that gives the directory name of the current module
  // '..' moves up one directory level from the current directory
  // 'access.log' is the file name we want to access or create in the parent directory
  // ! File is igniored in gitignore by default and need not be sent to git
  path.join(__dirname, "..", "access.log"),
  {
    flags: "a",
  }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Format Response
app.use(responseFormatter);

//  Winston Express Logger Middleware
app.use(expressWinstonLogger);

// Serve uploads statically
const uploadsDir = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../client/public/uploads");
if (fs.existsSync(uploadsDir)) {
  app.use("/uploads", express.static(uploadsDir));
}
const serverUploadsDir = path.resolve(__dirname, "../../uploads");
if (fs.existsSync(serverUploadsDir)) {
  app.use("/uploads", express.static(serverUploadsDir));
}

// Serve frontend static build if present
const frontendPublic = path.resolve(__dirname, "../../public");
if (fs.existsSync(frontendPublic)) {
  app.use(express.static(frontendPublic));
}

// Health check route for monitoring, Render checks, and DB verification
app.get(["/health", "/api/health"], async (req, res) => {
  if (req.query.retry === "true" && global.connectToDatabase) {
    try {
      await global.connectToDatabase();
    } catch (e) {
      // ignore
    }
  }

  const dbCheck = await testConnection();
  const isHealthy = dbCheck.connected;

  return res.status(StatusCodes.OK).json({
    status: isHealthy ? "ok" : "degraded",
    database: isHealthy ? "connected" : "disconnected",
    provider: "postgresql",
    supabase: {
      projectId: process.env.SUPABASE_PROJECT_ID || "uzgklxytaixdousaxhtb",
      region: process.env.SUPABASE_REGION || "ap-northeast-1",
    },
    diagnostics: global.__DB_STATUS__ || {},
    timestamp: new Date().toISOString(),
  });
});

//  Defining Routes
app.use("/", authRouter);
app.use("/users", usersRouter);
app.use("/", itemRouter);
app.use("/", adminRouter);
app.use("/", matchRouter);
app.use("/", claimRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log(swaggerSpecs);

// Fallback for SPA frontend routes (GET/HEAD requests)
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") {
    const indexPath = path.resolve(__dirname, "../../public/index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// send back a 404 error for any unknown api request
// Sequence is important
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json(null);
});

}

module.exports = configureApp;