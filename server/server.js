require("dotenv").config();
const server = require("http").createServer();

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (client) => {
  client.on("send_message", (data) => {
    // Broadcast to all users
    io.sockets.emit("receive_message", data);
  });
});

server.listen(process.env.PORT || 5000);
