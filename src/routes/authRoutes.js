const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
//const { getAllUsers } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
//router.get("/users", getAllUsers);

module.exports = router;
