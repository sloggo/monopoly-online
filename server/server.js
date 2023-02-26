const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");

app.use(cors());
const server = http.createServer(app);
const players = [];

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
});

io.on("connection", (socket) => {
    console.log("User connected: "+socket.id)

    socket.on("change-room", (data) => {
        socket.join(data.roomId)
        socket.in(data.roomId).emit("player-join", socket.id)
    })

    socket.on("emit-test", (data) => {
        console.log("received test emit from room", data.roomId)
        socket.in(data.roomId).emit("receive-test", data)
    })

})

server.listen(3001, () => {
    console.log("Server running!")
})