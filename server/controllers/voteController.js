const Vote = require("../models/Vote");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");

const voteOnQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user is trying to vote on their own question
    if (question.author.equals(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Cannot vote on your own question" });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      user: req.user._id,
      targetId: questionId,
    });

    if (existingVote) {
      // Remove previous vote from question
      if (existingVote.voteType === "upvote") {
        question.votes.upvotes.pull(req.user._id);
      } else {
        question.votes.downvotes.pull(req.user._id);
      }

      // If same vote type, remove the vote
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
      } else {
        // If different vote type, update the vote
        existingVote.voteType = voteType;
        await existingVote.save();

        // Add new vote to question
        if (voteType === "upvote") {
          question.votes.upvotes.push(req.user._id);
        } else {
          question.votes.downvotes.push(req.user._id);
        }
      }
    } else {
      // Create new vote
      const vote = new Vote({
        user: req.user._id,
        targetType: "Question",
        targetId: questionId,
        voteType,
      });
      await vote.save();

      // Add vote to question
      if (voteType === "upvote") {
        question.votes.upvotes.push(req.user._id);
      } else {
        question.votes.downvotes.push(req.user._id);
      }
    }

    // Update vote score
    question.calculateVoteScore();
    await question.save();

    // Update author's reputation
    const reputationChange = voteType === "upvote" ? 5 : -2;
    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: reputationChange },
    });

    res.json({
      message: "Vote recorded successfully",
      voteScore: question.voteScore,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const voteOnAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { voteType } = req.body;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Check if user is trying to vote on their own answer
    if (answer.author.equals(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Cannot vote on your own answer" });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      user: req.user._id,
      targetId: answerId,
    });

    if (existingVote) {
      // Remove previous vote from answer
      if (existingVote.voteType === "upvote") {
        answer.votes.upvotes.pull(req.user._id);
      } else {
        answer.votes.downvotes.pull(req.user._id);
      }

      // If same vote type, remove the vote
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
      } else {
        // If different vote type, update the vote
        existingVote.voteType = voteType;
        await existingVote.save();

        // Add new vote to answer
        if (voteType === "upvote") {
          answer.votes.upvotes.push(req.user._id);
        } else {
          answer.votes.downvotes.push(req.user._id);
        }
      }
    } else {
      // Create new vote
      const vote = new Vote({
        user: req.user._id,
        targetType: "Answer",
        targetId: answerId,
        voteType,
      });
      await vote.save();

      // Add vote to answer
      if (voteType === "upvote") {
        answer.votes.upvotes.push(req.user._id);
      } else {
        answer.votes.downvotes.push(req.user._id);
      }
    }

    // Update vote score
    answer.calculateVoteScore();
    await answer.save();

    // Update author's reputation
    const reputationChange = voteType === "upvote" ? 10 : -2;
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: reputationChange },
    });

    res.json({
      message: "Vote recorded successfully",
      voteScore: answer.voteScore,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  voteOnQuestion,
  voteOnAnswer,
};
