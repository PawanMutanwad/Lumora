// Debug script: reproduce the registration 500 error with full stack trace
require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://pawanmutanwad:LTneklFxL2stHeIb@ac-qfitfju-shard-00-00.qtclwtu.mongodb.net:27017,ac-qfitfju-shard-00-01.qtclwtu.mongodb.net:27017,ac-qfitfju-shard-00-02.qtclwtu.mongodb.net:27017/?ssl=true&replicaSet=atlas-kf2zmm-shard-0&authSource=admin&appName=Cluster0";

async function main() {
  console.log("=== STEP 1: Connecting to MongoDB ===");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");
  } catch (e) {
    console.error("MongoDB connection FAILED:", e.message);
    process.exit(1);
  }

  console.log("\n=== STEP 2: Loading auth-controller ===");
  let registerUser, loginUser, authMiddleware;
  try {
    const ctrl = require("./controllers/auth/auth-controller");
    registerUser = ctrl.registerUser;
    loginUser = ctrl.loginUser;
    authMiddleware = ctrl.authMiddleware;
    console.log("auth-controller loaded. Exports:", Object.keys(ctrl));
  } catch (e) {
    console.error("FAILED to load auth-controller:", e.message);
    console.error("STACK:", e.stack);
    process.exit(1);
  }

  // ---- REGISTRATION ----
  console.log("\n=== STEP 3: Calling registerUser() ===");
  const testData = {
    userName: "debuguser_" + Date.now(),
    email: "debug_" + Date.now() + "@test.com",
    password: "TestPass123",
  };
  console.log("Request body:", testData);

  let regStatus = null;
  let regBody = null;
  const regReq = { body: testData };
  const regRes = {
    status: function (code) {
      regStatus = code;
      console.log("  -> res.status() called with:", code);
      return this;
    },
    json: function (data) {
      regBody = data;
      console.log("  -> res.json() called with:", JSON.stringify(data));
      return this;
    },
    cookie: function (name, val, opts) {
      console.log("  -> res.cookie() called:", name);
      return this;
    },
  };

  try {
    console.log("  Entering registerUser()...");
    await registerUser(regReq, regRes);
    console.log("  registerUser() returned. Status:", regStatus, "Body:", JSON.stringify(regBody));
  } catch (uncaught) {
    console.error("  UNCAUGHT exception from registerUser():");
    console.error("  Type:", uncaught.constructor.name);
    console.error("  Message:", uncaught.message);
    console.error("  Code:", uncaught.code);
    console.error("  Stack:", uncaught.stack);
  }

  if (regStatus === 500 || !regBody?.success) {
    console.log("\n=== REGISTRATION FAILED — Deeper trace ===");
    // Manually trace each step
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const User = require("./models/User");

    console.log("  Step 3a: User.findOne({ email })...");
    try {
      const existing = await User.findOne({
        $or: [{ email: testData.email }, { userName: testData.userName }],
      });
      console.log("  findOne result:", existing);
    } catch (e) {
      console.error("  findOne THREW:", e.constructor.name, e.message);
      console.error("  Stack:", e.stack);
    }

    console.log("  Step 3b: bcrypt.hash()...");
    try {
      const hash = await bcrypt.hash(testData.password, 12);
      console.log("  hash result:", hash.substring(0, 20) + "...");
    } catch (e) {
      console.error("  bcrypt.hash THREW:", e.constructor.name, e.message);
      console.error("  Stack:", e.stack);
    }

    console.log("  Step 3c: new User() + save()...");
    try {
      const hash = await bcrypt.hash(testData.password, 12);
      const newUser = new User({
        userName: testData.userName + "_retry",
        email: testData.email + ".retry",
        password: hash,
      });
      console.log("  Created User instance, calling save()...");
      const saved = await newUser.save();
      console.log("  save() succeeded. _id:", saved._id);
      // Clean up
      await User.findByIdAndDelete(saved._id);
    } catch (e) {
      console.error("  save() THREW:", e.constructor.name, e.message);
      console.error("  Code:", e.code);
      console.error("  Stack:", e.stack);
    }
  }

  // ---- LOGIN ----
  if (regBody?.success) {
    console.log("\n=== STEP 4: Calling loginUser() ===");
    let loginStatus = null;
    let loginBody = null;
    let loginCookie = null;
    const loginReq = { body: { email: testData.email, password: testData.password } };
    const loginRes = {
      status: function (code) {
        loginStatus = code;
        console.log("  -> res.status() called with:", code);
        return this;
      },
      json: function (data) {
        loginBody = data;
        console.log("  -> res.json() called with:", JSON.stringify(data));
        return this;
      },
      cookie: function (name, val, opts) {
        loginCookie = val;
        console.log("  -> res.cookie() called:", name);
        return this;
      },
    };

    try {
      await loginUser(loginReq, loginRes);
      console.log("  loginUser() returned. Status:", loginStatus, "Body:", JSON.stringify(loginBody));
    } catch (uncaught) {
      console.error("  UNCAUGHT from loginUser():", uncaught.constructor.name, uncaught.message);
      console.error("  Stack:", uncaught.stack);
    }

    // ---- CHECK AUTH ----
    if (loginCookie) {
      console.log("\n=== STEP 5: Calling authMiddleware() ===");
      const checkReq = { cookies: { token: loginCookie } };
      const checkRes = {
        status: function (code) {
          console.log("  -> res.status() called with:", code);
          return this;
        },
        json: function (data) {
          console.log("  -> res.json() called with:", JSON.stringify(data));
          return this;
        },
      };
      try {
        await authMiddleware(checkReq, checkRes, () => {
          console.log("  authMiddleware called next(). req.user:", JSON.stringify(checkReq.user));
        });
      } catch (e) {
        console.error("  authMiddleware THREW:", e.constructor.name, e.message);
      }
    }
  }

  console.log("\n=== DONE ===");
  process.exit(0);
}

main();
