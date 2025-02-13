const express = require("express");
const AuthRoutes = require("./src/routes/AuthRoutes");
const authMiddleware = require("./src/middlewares/authMiddleware");
const PostRoutes = require("./src/routes/PostRoutes");
const MessagesRoutes = require("./src/routes/MessagesRoutes");
require("dotenv").config();
require("./src/db/index");
const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;
const userRoutes = require("./src/routes/UserRoutes");
const storiesRoutes = require("./src/routes/StoriesRoutes");

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// WebSocket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = decoded;
    next();
  });
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Join user's personal room
  socket.join(socket.user.id);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/auth", AuthRoutes);
app.use("/user", authMiddleware, userRoutes);
app.use("/post", authMiddleware, PostRoutes);
app.use("/messages", authMiddleware, MessagesRoutes);
app.use("/stories", authMiddleware, storiesRoutes);
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
