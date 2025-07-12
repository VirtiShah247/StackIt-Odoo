const Answer = require("../models/Answer");
const Question = require("../models/Question");
const User = require("../models/User");
const Notification = require("../models/Notification");

const createAnswer = async (req, res) => {
  try {
    const { questionId, content } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Create answer
    const answer = new Answer({
      content,
      author: req.user._id,
      question: questionId,
    });

    await answer.save();

    // Update question
    question.answers.push(answer._id);
    await question.save();

    // Update user's answers
    await User.findByIdAndUpdate(req.user._id, {
      $push: { answersGiven: answer._id },
    });

    // Create notification for question author
    if (!question.author.equals(req.user._id)) {
      const notification = new Notification({
        recipient: question.author,
        sender: req.user._id,
        type: "question_answered",
        message: `${req.user.username} answered your question: ${question.title}`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id,
      });
      await notification.save();
    }

    // Populate and return
    await answer.populate("author", "username avatar reputation");

    res.status(201).json({
      message: "Answer created successfully",
      answer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "voteScore";
    const order = req.query.order === "asc" ? 1 : -1;

    const answers = await Answer.find({ question: questionId })
      .populate("author", "username avatar reputation")
      .populate("comments.author", "username avatar")
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments({ question: questionId });

    res.json({
      answers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Check if user is the author or admin
    if (!answer.author.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    answer.content = content;
    await answer.save();

    await answer.populate("author", "username avatar reputation");

    res.json({
      message: "Answer updated successfully",
      answer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Check if user is the author or admin
    if (!answer.author.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Remove from question
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id },
    });

    // Remove from user's answers
    await User.findByIdAndUpdate(answer.author, {
      $pull: { answersGiven: answer._id },
    });

    await Answer.findByIdAndDelete(id);

    res.json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const comment = {
      author: req.user._id,
      content,
      createdAt: new Date(),
    };

    answer.comments.push(comment);
    await answer.save();

    // Create notification for answer author
    if (!answer.author.equals(req.user._id)) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user._id,
        type: "answer_commented",
        message: `${req.user.username} commented on your answer`,
        relatedAnswer: answer._id,
      });
      await notification.save();
    }

    await answer.populate("comments.author", "username avatar");

    res.json({
      message: "Comment added successfully",
      comment: answer.comments[answer.comments.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAnswer,
  getAnswers,
  updateAnswer,
  deleteAnswer,
  addComment,
};
