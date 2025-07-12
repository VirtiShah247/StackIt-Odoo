const express = require("express");
const router = express.Router();
const {
  createAnswer,
  getAnswers,
  updateAnswer,
  deleteAnswer,
  addComment,
} = require("../controllers/answerController");
const { auth, optionalAuth } = require("../middleware/auth");
const { validateAnswer } = require("../middleware/validation");

// Public routes
router.get("/question/:questionId", optionalAuth, getAnswers);

// Protected routes
router.post("/", auth, validateAnswer, createAnswer);
router.put("/:id", auth, validateAnswer, updateAnswer);
router.delete("/:id", auth, deleteAnswer);
router.post("/:id/comments", auth, addComment);

module.exports = router;
