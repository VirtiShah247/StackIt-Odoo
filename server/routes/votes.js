const express = require("express");
const router = express.Router();
const {
  voteOnQuestion,
  voteOnAnswer,
} = require("../controllers/voteController");
const { auth } = require("../middleware/auth");

router.post("/question/:questionId", auth, voteOnQuestion);
router.post("/answer/:answerId", auth, voteOnAnswer);

module.exports = router;
