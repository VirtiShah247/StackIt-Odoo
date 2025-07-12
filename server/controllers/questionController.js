const Question = require("../models/Question");
const Tag = require("../models/Tag");
const User = require("../models/User");

const createQuestion = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    // Process tags
    const tagIds = [];
    for (const tagName of tags) {
      let tag = await Tag.findOne({ name: tagName.toLowerCase() });
      if (!tag) {
        tag = new Tag({ name: tagName.toLowerCase(), createdBy: req.user._id });
        await tag.save();
      }
      tag.questionsCount += 1;
      await tag.save();
      tagIds.push(tag._id);
    }

    // Create question
    const question = new Question({
      title,
      description,
      author: req.user._id,
      tags: tagIds,
    });

    await question.save();

    // Update user's questions
    await User.findByIdAndUpdate(req.user._id, {
      $push: { questionsAsked: question._id },
    });

    // Populate and return
    await question.populate(["author", "tags"]);

    res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const search = req.query.search || "";
    const tags = req.query.tags ? req.query.tags.split(",") : [];

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (tags.length > 0) {
      const tagIds = await Tag.find({ name: { $in: tags } }).distinct("_id");
      query.tags = { $in: tagIds };
    }

    // Get questions
    const questions = await Question.find(query)
      .populate("author", "username avatar reputation")
      .populate("tags", "name color")
      .populate("acceptedAnswer")
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
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

const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate("author", "username avatar reputation")
      .populate("tags", "name color")
      .populate({
        path: "answers",
        populate: {
          path: "author",
          select: "username avatar reputation",
        },
      })
      .populate("acceptedAnswer");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Increment views if not the author
    if (!req.user || !req.user._id.equals(question.author._id)) {
      question.views += 1;
      await question.save();
    }

    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user is the author or admin
    if (!question.author.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update fields
    if (title) question.title = title;
    if (description) question.description = description;

    // Update tags if provided
    if (tags) {
      // Decrease count for old tags
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questionsCount: -1 } }
      );
      // Process new tags
      const tagIds = [];
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = new Tag({
            name: tagName.toLowerCase(),
            createdBy: req.user._id,
          });
          await tag.save();
        }
        tag.questionsCount += 1;
        await tag.save();
        tagIds.push(tag._id);
      }
      question.tags = tagIds;
    }

    await question.save();
    await question.populate(["author", "tags"]);

    res.json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user is the author or admin
    if (!question.author.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Decrease tag counts
    await Tag.updateMany(
      { _id: { $in: question.tags } },
      { $inc: { questionsCount: -1 } }
    );

    // Remove from user's questions
    await User.findByIdAndUpdate(question.author, {
      $pull: { questionsAsked: question._id },
    });

    await Question.findByIdAndDelete(id);

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const acceptAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user is the question author
    if (!question.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only question author can accept answers" });
    }

    // Update previous accepted answer
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, {
        isAccepted: false,
      });
    }

    // Set new accepted answer
    question.acceptedAnswer = answerId;
    question.isResolved = true;
    await question.save();

    const Answer = require("../models/Answer");
    await Answer.findByIdAndUpdate(answerId, {
      isAccepted: true,
    });

    res.json({ message: "Answer accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  acceptAnswer,
};
