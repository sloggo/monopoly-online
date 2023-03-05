const express = require("express");
const mongoose = require("mongoose")
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");
const port = 3001
const {Player} = require("./models/player")
const {Board} = require("./models/board");
const { ObjectId } = require("mongodb");
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
        const playerLeftExists = await Player.exists({socketId: socket.id})
        const playerLeft = await Player.findOne({socketId: socket.id})

        if(!playerLeftExists){
            return
        }

        if(!playerLeft.inRoomId){
            playerLeft.deleteOne()
            return
        }

        const boardPlayerLeft = await Board.findOne({_id: playerLeft.inRoomId})

        if(!boardPlayerLeft.players){
            boardPlayerLeft.deleteOne()
            playerLeft.deleteOne()
        }

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

        let newBoard = new Board()
        newPlayer.inRoomId = newBoard._id
        newPlayer.save()

        newBoard.players.push(newPlayer._id)
        newBoard.currentPlayer = newPlayer._id
        newBoard.save()

        socket.join(String(newBoard._id))
        console.log("New Board created at id;", String(newBoard._id))

        socket.emit("joinedRoom", {board: newBoard, player: newPlayer})
    })

    socket.on("changeTest", async(player) => {
        const playerDb = await Player.findOne({_id: player._id})

        playerDb.username = "changed";
        playerDb.save()
    })

    socket.on("joinRoom", async(codeInput) => {
        let newPlayer = new Player()
        newPlayer.username = "testing2"
        newPlayer.socketId = socket.id

        if(!ObjectId.isValid(codeInput)){
            console.log("No room;", codeInput)
            socket.emit("error", "Not a valid code; "+codeInput)
            return
        }

        const existingRoom = await Board.exists({_id: codeInput})

        if(!existingRoom){
            console.log("No room;", codeInput)
            socket.emit("error", "No room exists with code; "+codeInput)
            return
        }

        existingRoom.players.push(newPlayer._id)
        existingRoom.save()

        socket.join(codeInput)
        newPlayer.inRoomId = existingRoom._id
        newPlayer.save()
        socket.emit("joinedRoom", {board: existingRoom, player: newPlayer})
    })
});

server.listen(port, () => {
    console.log("Server listening on", port)
})