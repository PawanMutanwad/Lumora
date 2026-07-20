const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const shopProductsRouter = require('./routes/shop/products-routes');

const app = express();

// MongoDB Connection
mongoose
  .connect(
    "mongodb://pawanmutanwad:LTneklFxL2stHeIb@ac-qfitfju-shard-00-00.qtclwtu.mongodb.net:27017,ac-qfitfju-shard-00-01.qtclwtu.mongodb.net:27017,ac-qfitfju-shard-00-02.qtclwtu.mongodb.net:27017/?ssl=true&replicaSet=atlas-kf2zmm-shard-0&authSource=admin&appName=Cluster0"
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
app.use('/api/auth',authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use('/api/shop/products', shopProductsRouter);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is Running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});