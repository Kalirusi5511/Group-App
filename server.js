require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* =========================
   MongoDB Verbindung
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

/* =========================
   Test API Routen
========================= */
app.get("/api/auth", (req, res) => {
  res.json({ message: "Auth route working" });
});

app.get("/api/groups", (req, res) => {
  res.json({ message: "Groups route working" });
});

/* =========================
   Socket.io Echtzeit
========================= */
io.on("connection", (socket) => {
  console.log("🔌 User connected");

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
  });

  socket.on("newLink", ({ groupId, link }) => {
    io.to(groupId).emit("linkAdded", link);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

/* =========================
   Server Start
========================= */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
