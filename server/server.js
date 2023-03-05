const express = require("express");
const mongoose = require("mongoose")
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");
const port = 3001
const {Player} = require("./models/player")
let db;

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
});

const uri = "mongodb+srv://sloggo:admin@monopolyonline.pj4zqbf.mongodb.net/?"
const mongoDB = mongoose.connect(uri)

io.on('connection', async function (socket) {
    console.log(`New connection: ${socket.id}`);

    const playerQuery = await Player.findOne({socketId : socket.id})
    if(playerQuery){
        return
    }

    let newPlayer = new Player()
    newPlayer.username = "testing"
    newPlayer.socketId = socket.id
    newPlayer.save()

    socket.on('disconnect', async () => {
        console.log(`Connection left (${socket.id})`)
        await Player.findOneAndDelete({socketId: socket.id})
    });
});

server.listen(port, () => {
    console.log("Server listening on", port)
})