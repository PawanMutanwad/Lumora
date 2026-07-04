const express = require("express");
const { registerUser, loginUser } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
route.post("/login", loginUser);

module.exports = router;