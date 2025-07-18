const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const { validateUser } = require("../middleware/validation");

// Public routes
router.post("/register", validateUser, register);
router.post("/login", login);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;
