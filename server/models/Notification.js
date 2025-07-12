const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "question_answered",
        "answer_commented",
        "answer_accepted",
        "mention",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    relatedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
