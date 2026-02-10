require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/groups", require("./routes/groups"));

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
    });

    socket.on("newLink", ({ groupId, link }) => {
        io.to(groupId).emit("linkAdded", link);
    });
});

server.listen(process.env.PORT || 3000, () =>
    console.log("Server running")
);
