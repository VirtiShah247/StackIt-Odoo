const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  acceptAnswer,
} = require("../controllers/questionController");
const { auth, optionalAuth } = require("../middleware/auth");
const { validateQuestion } = require("../middleware/validation");

// Public routes
router.get("/", optionalAuth, getQuestions);
router.get("/:id", optionalAuth, getQuestion);

// Protected routes
router.post("/", auth, validateQuestion, createQuestion);
router.put("/:id", auth, validateQuestion, updateQuestion);
router.delete("/:id", auth, deleteQuestion);
router.post("/accept-answer", auth, acceptAnswer);

module.exports = router;
