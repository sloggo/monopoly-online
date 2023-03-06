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
    let roomId;

    socket.on('disconnect', async () => {
        console.log(`Connection left (${socket.id})`)
        const boardPlayerLeft = await Board.findOne({_id: roomId});

        if(!boardPlayerLeft){
            return
        }

        const playerIndex = boardPlayerLeft.players.findIndex(player => player.socketId === socket.id)
        boardPlayerLeft.players.splice(playerIndex,1)

        if(boardPlayerLeft.players.length >= 1){
            boardPlayerLeft.save()
            socket.to(roomId).emit("boardUpdate", {board: boardPlayerLeft})
            return 
        }

        boardPlayerLeft.deleteOne()
    });

    socket.on("createRoom", async(socketId) => {
        let newPlayer = {
            socketId: socket.id,
            username: "sloggo",
            ready: false,
        }

        let newBoard = new Board()

        newBoard.players.push(newPlayer)
        newBoard.currentPlayer = newPlayer
        newBoard.save()

        socket.join(String(newBoard._id))
        console.log("New Board created at id;", String(newBoard._id))

        socket.emit("joinedRoom", {board: newBoard})
        roomId = String(newBoard._id)
    })

    socket.on("changeTest", async(player) => {
        const playerDb = await Player.findOne({_id: player._id})

        playerDb.username = "changed";
        playerDb.save()
    })

    socket.on("joinRoom", async(codeInput) => {
        let newPlayer = {
            socketId: socket.id,
            username: "sloggo2",
            ready: false,
        }

        if(!ObjectId.isValid(codeInput)){
            console.log("No room;", codeInput)
            socket.emit("error", "Not a valid code; "+codeInput)
            return
        }

        const existingRoom = await Board.findOne({_id: codeInput})

        if(!existingRoom){
            console.log("No room;", codeInput)
            socket.emit("error", "No room exists with code; "+codeInput)
            return
        }

        existingRoom.players.push(newPlayer)
        existingRoom.save()

        socket.join(codeInput)
        socket.emit("joinedRoom", {board: existingRoom, player: newPlayer})
        socket.to(codeInput).emit("boardUpdate", {board: existingRoom})
        roomId = String(codeInput)
    })

    socket.on("toggleReady", async(data) => {
        let board = await Board.findOne({_id: data.boardData._id})
        console.log(socket.id, "looking for")

        let playerIndex = board.players.findIndex(player => {
            console.log(player.socketId)
            if(player.socketId === socket.id) return true
        })

        let player = data.boardData.players[playerIndex]
        console.log(player, "before")

        const oldReady = player.ready

        player.ready = !oldReady
        console.log(player, "after")

        board.players.splice(playerIndex,1,player)

        if(board.currentPlayer.socketId === board.players[playerIndex].socketId){
            board.currentPlayer = board.players[playerIndex]
        }

        await board.save()
        console.log(roomId)
        io.in(roomId).emit("boardUpdate", {board})
        console.log("sent emit to", roomId)
    })
});

server.listen(port, () => {
    console.log("Server listening on", port)
})