const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initializeSocket = (socketIo) => {
  io = socketIo;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.username} connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join question rooms
    socket.on("join_question", (questionId) => {
      socket.join(`question_${questionId}`);
    });

    socket.on("leave_question", (questionId) => {
      socket.leave(`question_${questionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.username} disconnected`);
    });
  });
};

const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit("notification", notification);
  }
};

const emitToQuestion = (questionId, event, data) => {
  if (io) {
    io.to(`question_${questionId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  emitNotification,
  emitToQuestion,
};
