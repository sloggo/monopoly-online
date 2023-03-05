const express = require("express");
const mongoose = require("mongoose")
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");
const port = 3001
const {Player} = require("./models/player")
const {Board} = require("./models/board")
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

    socket.on('disconnect', async () => {
        console.log(`Connection left (${socket.id})`)
        const playerLeft = await Player.findOne({socketId: socket.id})

        if(!playerLeft.inRoomId){
            playerLeft.deleteOne()
            return
        }

        const boardPlayerLeft = await Board.findOne({_id: playerLeft.inRoomId})
        const playerIndex = boardPlayerLeft.players.findIndex(player => player._id === playerLeft._id)

        boardPlayerLeft.players.splice(playerIndex,1)

        if(boardPlayerLeft.players.length > 1){
            playerLeft.deleteOne()
            boardPlayerLeft.save()
            return 
        }

        boardPlayerLeft.deleteOne()
        playerLeft.deleteOne()
    });

    socket.on("createRoom", async(socketId) => {
        let newPlayer = new Player()
        newPlayer.username = "testing"
        newPlayer.socketId = socket.id
        socket.emit("playerUpdate", newPlayer)

        let newBoard = new Board()
        newPlayer.inRoomId = newBoard._id
        newPlayer.save()

        newBoard.players.push(newPlayer)
        newBoard.currentPlayer = newPlayer
        newBoard.save()

        socket.join(String(newBoard._id))
        console.log("New Board created at id;", String(newBoard._id))

        socket.emit("joinedRoom", {board: newBoard, player: newPlayer})
    })
});

server.listen(port, () => {
    console.log("Server listening on", port)
})