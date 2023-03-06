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
        roomId = null
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
        newBoard.numPlayers = 2
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

        if(!existingRoom.joinable){
            console.log("Room full;", codeInput)
            socket.emit("error", "Room is either full or game has started; "+codeInput)
            return
        }

        existingRoom.players.push(newPlayer)
        
        if(existingRoom.players.length >= existingRoom.numPlayers){
            existingRoom.joinable = false;
        }

        existingRoom.save()

        socket.join(codeInput)
        socket.emit("joinedRoom", {board: existingRoom, player: newPlayer})
        socket.to(codeInput).emit("boardUpdate", {board: existingRoom})
        roomId = String(codeInput)
    })

    socket.on("toggleReady", async(data) => {
        let board = await Board.findOne({_id: data.boardData._id})

        let playerIndex = board.players.findIndex(player => {
            if(player.socketId === socket.id) return true
        })

        let player = data.boardData.players[playerIndex]
        const oldReady = player.ready
        player.ready = !oldReady
        board.players.splice(playerIndex,1,player)

        if(board.currentPlayer.socketId === board.players[playerIndex].socketId){
            board.currentPlayer = board.players[playerIndex]
        }

        await board.save()
        io.in(roomId).emit("boardUpdate", {board})
    })

    socket.on("startGame", async(data) => {
        console.log("Game started at;", data.boardData._id)
        let board = await Board.findOne({_id: data.boardData._id})

        board.joinable = false
        board.save()
        io.in(roomId).emit("gameStarted", {board})
    })

    socket.on("rollDice", async(data) => {
        let board = await Board.findOne({_id: data.boardData._id});
        let currentPlayer = board.currentPlayer

        if(!(socket.id === currentPlayer.socketId)){
            socket.emit("error", "Not your turn!")
            return
        }

        let diceRoll = rollDice()

        let currentPlayerIndex = board.players.findIndex(player => player.socketId === currentPlayer.socketId)

        const newTileId = currentPlayer.currentTile.tileId + diceRoll;
        const newTile = board.tileData.find(tile => tile.tileId === newTileId);
        currentPlayer.currentTile = newTile;

        board.players.splice(currentPlayerIndex, 1, currentPlayer);
        await board.save()
        io.to(roomId).emit("boardUpdate", {board, diceRoll})

        if(currentPlayer.currentTile.forSale === true && !currentPlayer.currentTile.owner){
            socket.emit("buyProperty", {property:currentPlayer.currentTile, board})
        }
    })

    socket.on("wantsToBuyProperty", async(property) => {
        let board = await Board.findOne({_id: roomId});
        let currentPlayer = board.currentPlayer
        let currentPlayerIndex = board.players.findIndex(player => player.socketId === socket.id)
        let propertyInBoard = board.tileData.find(tile => tile.tileId === property.tileId)
        let propertyInBoardIndex = board.tileData.findIndex(tile => tile.tileId === property.tileId)

        if(!currentPlayer.money >= property.price){
            socket.emit("error", "Not enough money!")
            return
        }

        currentPlayer.money = currentPlayer.money - property.price
        propertyInBoard.forSale = false
        currentPlayer.ownedTiles.push(propertyInBoard)

        board.players.splice(currentPlayerIndex, 1, currentPlayer);
        board.tileData.splice(propertyInBoardIndex, 1, propertyInBoard)

        console.log({...board})
        await board.save()
        io.in(roomId).emit("boardUpdate", {board})
    })
});

server.listen(port, () => {
    console.log("Server listening on", port)
})

const rollDice = () => {
    return Math.floor(Math.random() * (6 - 1 + 1) + 1)
}