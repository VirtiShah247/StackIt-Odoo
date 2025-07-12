const { body, validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

const validateQuestion = [
  body("title")
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage("Title must be between 10 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 30 })
    .withMessage("Description must be at least 30 characters"),
  body("tags")
    .isArray({ min: 1, max: 5 })
    .withMessage("Must have between 1 and 5 tags"),
  validateRequest,
];

const validateAnswer = [
  body("content")
    .trim()
    .isLength({ min: 30 })
    .withMessage("Answer must be at least 30 characters"),
  validateRequest,
];

const validateUser = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validateRequest,
];

module.exports = {
  validateQuestion,
  validateAnswer,
  validateUser,
  validateRequest,
};
