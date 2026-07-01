const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://pawanmutanwad:LTneklFxL2stHeIb@cluster0.qtclwtu.mongodb.net/"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is Running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});