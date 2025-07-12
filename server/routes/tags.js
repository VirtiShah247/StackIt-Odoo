const express = require("express");
const router = express.Router();
const {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const { auth, adminAuth } = require("../middleware/auth");

// Public routes
router.get("/", getAllTags);

// Protected routes
router.post("/", auth, adminAuth, createTag);
router.put("/:id", auth, updateTag);
router.delete("/:id", auth, adminAuth, deleteTag);

module.exports = router;
