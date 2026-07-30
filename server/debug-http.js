// Debug: Start actual Express server with verbose logging, then send a registration request
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://pawanmutanwad:LTneklFxL2stHeIb@ac-qfitfju-shard-00-00.qtclwtu.mongodb.net:27017,ac-qfitfju-shard-00-01.qtclwtu.mongodb.net:27017,ac-qfitfju-shard-00-02.qtclwtu.mongodb.net:27017/?ssl=true&replicaSet=atlas-kf2zmm-shard-0&authSource=admin&appName=Cluster0";

async function main() {
  console.log("=== Connecting to MongoDB ===");
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected.");

  const app = express();

  // Middleware (same as server.js)
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  // Add request logging
  app.use((req, res, next) => {
    console.log(`\n>>> ${req.method} ${req.url}`);
    console.log(">>> Headers content-type:", req.headers["content-type"]);
    console.log(">>> Body:", JSON.stringify(req.body));
    next();
  });

  // Mount auth routes
  const authRouter = require("./routes/auth/auth-routes");
  app.use("/api/auth", authRouter);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("=== EXPRESS ERROR HANDLER ===");
    console.error("Type:", err.constructor.name);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ success: false, message: err.message });
  });

  // Start on a different port so it doesn't conflict
  const PORT = 5099;
  app.listen(PORT, async () => {
    console.log(`Debug server listening on port ${PORT}`);
    console.log("\n=== Sending POST /api/auth/register ===");

    const testData = JSON.stringify({
      userName: "httptest_" + Date.now(),
      email: "httptest_" + Date.now() + "@test.com",
      password: "TestPass123",
    });

    // Use native http to send request
    const options = {
      hostname: "localhost",
      port: PORT,
      path: "/api/auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(testData),
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        console.log("\n=== REGISTER RESPONSE ===");
        console.log("Status:", res.statusCode);
        console.log("Body:", body);

        if (res.statusCode === 200) {
          // Now test against the LIVE running server on port 5000
          console.log("\n=== Now testing against LIVE server on port 5000 ===");
          const liveOptions = {
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/register",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(testData.replace("httptest_", "livetest_")),
            },
          };
          const liveData = testData.replace(/httptest_/g, "livetest_");
          const liveReq = http.request(liveOptions, (liveRes) => {
            let liveBody = "";
            liveRes.on("data", (chunk) => (liveBody += chunk));
            liveRes.on("end", () => {
              console.log("LIVE Status:", liveRes.statusCode);
              console.log("LIVE Body:", liveBody);
              process.exit(0);
            });
          });
          liveReq.on("error", (e) => {
            console.error("LIVE request error:", e.message);
            process.exit(0);
          });
          liveReq.write(liveData);
          liveReq.end();
        } else {
          process.exit(0);
        }
      });
    });

    req.on("error", (e) => {
      console.error("Request error:", e.message);
      process.exit(1);
    });

    req.write(testData);
    req.end();
  });
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
