const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");
const port = 3001
const {Player} = require("./models/player")
const {Board} = require("./models/board");
const { ObjectId } = require("mongodb");
const db = require("./models/mongodb")
const chanceData = require("./chance.json")

const gamesRoute = require("./routes/games")

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
});

app.use("/games", gamesRoute)

const sleep = async (milliseconds) => {
    await new Promise(resolve => {
        return setTimeout(resolve, milliseconds)
    });
};

const rollDice = () => {
    return Math.floor(Math.random() * (6 - 1 + 1) + 1)
}

const nextPlayer = async (board, roomId) => {
    // move to next player in the game
    let currentPlayer = board.players.find(player => player.socketId === board.currentPlayer.socketId)

    let playablePlayers = board.players.filter(player => player.bankrupt === false)
    let currentPlayerPlayableIndex = playablePlayers.findIndex(player => player.socketId === board.currentPlayer.socketId)
    let currentPlayerIndex = board.players.findIndex(player => player.socketId === board.currentPlayer.socketId)

    if(currentPlayer && currentPlayer.money < 0 ){
        currentPlayer.bankrupt = true
    }

    if((playablePlayers.length === 2 && currentPlayer.bankrupt === true) || playablePlayers.length === 1){
        io.in(roomId).emit("gameOver", {board, winner: playablePlayers.find(player => player.bankrupt === false), type: "gameOver"})
    } else{
        let newIndexPlayable = (currentPlayerPlayableIndex + 1) % playablePlayers.length
        let newIndexPlayerPlayable = playablePlayers[newIndexPlayable]
        let newIndex = board.players.findIndex(player => player.socketId === newIndexPlayerPlayable.socketId)

        let newCurrentPlayer = board.players[newIndex]
        board.currentPlayer = newCurrentPlayer
        await board.save()
        io.in(roomId).emit("boardUpdate", {board})
    }

}

const findBoard = async (boardId) => {
    return Board.findOne({_id: boardId})
}

const findPlayer = async(board, playerSocketId)=>{
    return board.players.find(player => player.socketId === playerSocketId)
}

const findPlayerIndex = async(board, playerSocketId)=>{
    return board.players.findIndex(player => player.socketId === playerSocketId)
}

const findTile = async(board, tileId) => {
    return board.tileData.find(tile => tile.tileId === tileId)
}

const findTileIndex = async(board, tileInput) => {
    return board.tileData.findIndex(tile => tile.tileId === tileInput.tileId)
}
const payPlayer = async(board, playerPayingID, playerPaidID, amount, roomId, next = true) => {
    let playerPaying = await findPlayer(board, playerPayingID);
    let playerPayingIndex = await findPlayerIndex(board, playerPayingID);

    let playerPaid;
    let playerPaidIndex;

    if(playerPaidID){
        playerPaid = await findPlayer(board, playerPaidID)
        playerPaidIndex = await findPlayerIndex(board, playerPaidID)
        playerPaid.money = playerPaid.money + amount
        await board.players.splice(playerPaidIndex, 1, playerPaid)
    }

    if(playerPayingID){
        playerPaying.money = playerPaying.money - amount
        board.currentPlayer = playerPaying
        await board.players.splice(playerPayingIndex, 1, playerPaying)
    }

    if(next){
        await nextPlayer(board, roomId)
    }
}

const getRentPrice = (property) => {
    if(!property.houses){
        return property.price*0.05
    }

    if(property.tileId === 4 || property.tileId === 38){
        return property.price
    }

    let noHouses = property.houses.length
    switch (noHouses){
        case 1:
            return property.price*(1/8)
        case 2:
            return property.price*(1/6)
        case 3:
            return property.price*(1/4)
        case noHouses >= 4:
            return property.price*(1/2)
    }
}

const getAllPropertiesOwned = async(board, playerSocketId) => {
    let player = await findPlayer(board, playerSocketId)

    return board.tileData.filter(tile => tile.owner === playerSocketId)
}

const chanceCard = async(randomChance, board, currentPlayer, currentPlayerIndex, socket, roomId)=>{
    // carries out all computation of chance cards
    
    console.log("chance")

    switch(randomChance.type){
        case 'advance':
            const newTile = await findTile(board, randomChance.tileId)
            console.log(newTile)
            currentPlayer.currentTile = newTile;
            currentPlayer.position = {
                x: newTile.mapPosition.x,
                y: newTile.mapPosition.y
            }
            
            board.players.splice(currentPlayerIndex, 1, currentPlayer);
            board.currentPlayer.currentTile = newTile
            board.currentPlayer.position = {
                x: newTile.mapPosition.x,
                y: newTile.mapPosition.y
            }

            if(newTile.tileId === 4 || newTile.tileId === 38){
                let price = await getRentPrice(currentPlayer.currentTile)
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
                return
            }    
        
            if(currentPlayer.currentTile && (currentPlayer.currentTile.forSale === true && !currentPlayer.currentTile.owner)){
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, type:"buyProperty?"})
                return
            } else if(currentPlayer.currentTile && currentPlayer.currentTile.owner && (currentPlayer.currentTile.owner !== currentPlayer.socketId)){
                let price = await getRentPrice(currentPlayer.currentTile)
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
                return
            } else{
                nextPlayer(board, roomId);
            }

            break;

        case 'advancespecific':
            let nearestTile;

            let validTiles = board.tileData.filter(i => i.special && i.special === randomChance.nearest)
            console.log("Valid:",validTiles)

            for(let i = 0; i < validTiles.length; i++){
                if(!nearestTile){
                    nearestTile = validTiles[i]
                } else{
                    if(!nearestTile.mapPosition && validTiles[i].mapPosition){
                        nearestTile = validTiles[i]
                    } else if(nearestTile.mapPosition && validTiles[i].mapPosition){
                        let currentNearestTileDistance = Math.abs((currentPlayer.position.x - nearestTile.mapPosition.x) + (currentPlayer.position.y - nearestTile.mapPosition.y))
                        let iTileDistance = Math.abs((currentPlayer.position.x - validTiles[i].mapPosition.x) + (currentPlayer.position.y - validTiles[i].mapPosition.y))

                        if(iTileDistance < currentNearestTileDistance){
                            nearestTile = validTiles[i]
                        }
                    }
                }
            }

            console.log("Nearest:", nearestTile)

            currentPlayer.currentTile = nearestTile;
            currentPlayer.position = {
                x: nearestTile.mapPosition.x,
                y: nearestTile.mapPosition.y
            }
            
            board.players.splice(currentPlayerIndex, 1, currentPlayer);
            board.currentPlayer.currentTile = nearestTile
            board.currentPlayer.position = {
                x: nearestTile.mapPosition.x,
                y: nearestTile.mapPosition.y
            }
            await board.save()
            io.to(roomId).emit("boardUpdate", {board})

            if(nearestTile.tileId === 4 || nearestTile.tileId === 38){
                let multiplier = randomChance.rentMultiplier ? randomChance.rentMultiplier : 1;
                let price = await getRentPrice(currentPlayer.currentTile)*multiplier
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
                return
            }    
        
            if(currentPlayer.currentTile && (currentPlayer.currentTile.forSale === true && !currentPlayer.currentTile.owner)){
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, type:"buyProperty?"})
                return
            } else if(currentPlayer.currentTile && currentPlayer.currentTile.owner && (currentPlayer.currentTile.owner !== currentPlayer.socketId)){
                let multiplier = randomChance.rentMultiplier ? randomChance.rentMultiplier : 1;
                let price = await getRentPrice(currentPlayer.currentTile)*multiplier
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
                return
            } else{
                nextPlayer(board, roomId);
            }

            break;
        case 'earn':
            payPlayer(board, null, currentPlayer.socketId, randomChance.amount, roomId)

            break;
        case 'jailfree':
            
            if(board.currentPlayer.getOutOfJailFree){
                board.currentPlayer.getOutOfJailFree = board.currentPlayer.getOutOfJailFree + 1
            } else{
                board.currentPlayer.getOutOfJailFree = 1
            }

            let newCurPlayer = {...board.currentPlayer}

            board.players.splice(currentPlayerIndex, 1, newCurPlayer);
            console.log(board.currentPlayer, board.players)

            await board.save()
            io.to(roomId).emit("boardUpdate", {board})
            nextPlayer(board, roomId);

            break;
        case 'moveback':
            const backTile = await findTile(board, Math.abs(currentPlayer.currentTile.tileId-randomChance.amount))
            console.log(backTile)
            currentPlayer.currentTile = backTile;
            currentPlayer.position = {
                x: backTile.mapPosition.x,
                y: backTile.mapPosition.y
            }
            
            board.players.splice(currentPlayerIndex, 1, currentPlayer);
            board.currentPlayer.currentTile = backTile
            board.currentPlayer.position = {
                x: backTile.mapPosition.x,
                y: backTile.mapPosition.y
            }
            await board.save()
            io.to(roomId).emit("boardUpdate", {board})

            if(backTile.tileId === 4 || backTile.tileId === 38){
                let price = await getRentPrice(currentPlayer.currentTile)
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
                return
            }    
        
            if(currentPlayer.currentTile && (currentPlayer.currentTile.forSale === true && !currentPlayer.currentTile.owner)){
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, type:"buyProperty?"})
                return
            } else if(currentPlayer.currentTile && currentPlayer.currentTile.owner && (currentPlayer.currentTile.owner !== currentPlayer.socketId)){
                let price = await getRentPrice(currentPlayer.currentTile)
                socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
                return
            } else{
                nextPlayer(board, roomId);
            }

            break;
        case 'payperhousehotel':
            let ownedTiles = board.tileData.filter(tile => tile.owner === currentPlayer.socketId)
            let noHouses;
            
            ownedTiles.map(tile => {
                if(tile.houses){
                    noHouses = noHouses + tile.houses.length
                }
                return
            })

            let cost = noHouses ? noHouses*randomChance.amount.house : 0;

            if(cost){
                payPlayer(board, currentPlayer.socketId, null, cost, roomId)
            } else{
                nextPlayer(board, roomId)
            }

            break;
        case 'pay':
            payPlayer(board, currentPlayer.socketId, null, randomChance.amount, roomId)

            break;
        case 'payplayers':
            for(let i=0; i < board.players.length ; i++){
                if(board.players[i].socketId !== socket.id){
                    payPlayer(board, currentPlayer.socketId, board.players[i].socketId, randomChance.amount, roomId, false)
                }
            }

            await board.save()
            io.to(roomId).emit("boardUpdate", {board})
            nextPlayer(board, roomId);
            break;
    }

}

// network functions
io.on('connection', async function (socket) {
    console.log(`New connection: ${socket.id}`);
    let roomId;

    socket.on('disconnect', async () => {
        console.log(`Connection left (${socket.id})`)
        const boardPlayerLeft = await findBoard(roomId)

        if(!boardPlayerLeft){
            return
        }

        const playerIndex = await findPlayerIndex(boardPlayerLeft, socket.id)
        const playerLeft = await findPlayer(boardPlayerLeft, socket.id)
        boardPlayerLeft.players.splice(playerIndex,1)

        if(boardPlayerLeft.players.length >= 1){
            if (boardPlayerLeft.currentPlayer.socketId === playerLeft.socketId){
                nextPlayer(boardPlayerLeft, roomId)
            } else{
                boardPlayerLeft.save()
                socket.to(roomId).emit("boardUpdate", {board: boardPlayerLeft})
            }
            return 
        }

        boardPlayerLeft.deleteOne()
        roomId = null
    });

    socket.on('leaveRoom', async () => {
        console.log(`Connection left (${socket.id})`)
        const boardPlayerLeft = await findBoard(roomId)

        if(!boardPlayerLeft){
            return
        }

        const playerIndex = await findPlayerIndex(boardPlayerLeft, socket.id)
        const playerLeft = await findPlayer(boardPlayerLeft, socket.id)
        boardPlayerLeft.players.splice(playerIndex,1)

        if(boardPlayerLeft.players.length >= 1){
            if (boardPlayerLeft.currentPlayer.socketId === playerLeft.socketId){
                nextPlayer(boardPlayerLeft, roomId)
            } else{
                boardPlayerLeft.save()
                socket.to(roomId).emit("boardUpdate", {board: boardPlayerLeft})
            }
            return 
        }

        boardPlayerLeft.deleteOne()
        roomId = null
    });

    socket.on("createRoom", async(socketId) => {
        console.log("Creating new room...")
        let newPlayer = {
            socketId: socket.id,
            username: "sloggo",
            ready: false,
            money: 1000
        }

        let newBoard = new Board()

        newBoard.players.push(newPlayer)
        newBoard.currentPlayer = newPlayer
        newBoard.numPlayers = 8
        newBoard.save()

        socket.join(String(newBoard._id))
        console.log("New Board created at id;", String(newBoard._id))

        socket.emit("joinedRoom", {board: newBoard})
        roomId = String(newBoard._id)
    })

    socket.on("joinRoom", async(codeInput) => {
        let newPlayer = {
            socketId: socket.id,
            username: "sloggo2",
            ready: false,
            money: 1000
        }

        if(!ObjectId.isValid(codeInput)){
            console.log("No room;", codeInput)
            socket.emit("error", "Not a valid code; "+codeInput)
            return
        }

        const existingRoom = await findBoard(codeInput)

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
        let board = await findBoard(roomId);

        let player = await findPlayer(board, socket.id)
        let playerIndex = await findPlayerIndex(board, socket.id)
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
        let board = await findBoard(data.boardData._id)

        board.joinable = false
        board.save()
        io.in(roomId).emit("gameStarted", {board})
    })

    socket.on("rollDice", async(data) => {
        let board = await findBoard(roomId);
        let currentPlayer = await findPlayer(board, board.currentPlayer.socketId)
        if(!(socket.id === currentPlayer.socketId)){
            socket.emit("error", "Not your turn!")
            return
        }

        let diceRoll = rollDice()

        let currentPlayerIndex = await findPlayerIndex(board, board.currentPlayer.socketId)

        const newTileId = ((currentPlayer.currentTile.tileId + diceRoll)%40);
        const newTile = await findTile(board, newTileId)
        currentPlayer.currentTile = newTile;
        currentPlayer.position = {
            x: newTile.mapPosition.x,
            y: newTile.mapPosition.y
        }

        console.log(currentPlayer)

        board.players.splice(currentPlayerIndex, 1, currentPlayer);
        board.currentPlayer.currentTile = newTile
        board.currentPlayer.position = {
            x: newTile.mapPosition.x,
            y: newTile.mapPosition.y
        }

        await board.save()

        io.to(roomId).emit("boardUpdate", {board, diceRoll})
        if(newTile.name === 'Chance'){
            let randomChance = chanceData[Math.floor(Math.random()*chanceData.length)]

            socket.emit("newNotification", {board, randomChance, type:"chance"})
            return
        }

        if(newTile.tileId === 4 || newTile.tileId === 38){
            let price = await getRentPrice(currentPlayer.currentTile)
            socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
            return
        }    
    
        if(currentPlayer.currentTile && (currentPlayer.currentTile.forSale === true && !currentPlayer.currentTile.owner)){
            socket.emit("newNotification", {board, property:currentPlayer.currentTile, type:"buyProperty?"})
            return
        } else if(currentPlayer.currentTile && currentPlayer.currentTile.owner && (currentPlayer.currentTile.owner !== currentPlayer.socketId)){
            let price = await getRentPrice(currentPlayer.currentTile)
            socket.emit("newNotification", {board, property:currentPlayer.currentTile, price, type:"payRent"})
            return
        } else{
            nextPlayer(board, roomId);
        }
    })

    socket.on("wantsToBuyProperty", async(property) => {
        let board = await findBoard(roomId);
        let currentPlayer = await findPlayer(board, socket.id)
        let currentPlayerIndex = await findPlayerIndex(board, socket.id)
        let propertyInBoard = await findTile(board, property.tileId)
        let propertyInBoardIndex = await findTileIndex(board, property)

       /* if(currentPlayer.money < property.price){
            socket.emit("error", "Not enough money!")
            nextPlayer(board, roomId);
            return
        } */

        currentPlayer.money = currentPlayer.money - property.price
        propertyInBoard.forSale = false
        propertyInBoard.owner = currentPlayer.socketId
        currentPlayer.currentTile = propertyInBoard
        board.currentPlayer = currentPlayer

        board.players.splice(currentPlayerIndex, 1, currentPlayer);
        board.tileData.splice(propertyInBoardIndex, 1, propertyInBoard)
        await board.save()

        nextPlayer(board, roomId)
    })

    socket.on("declineBuy", async(boardData)=>{
        let board = await findBoard(boardData._id)
        nextPlayer(board, roomId);
    })

    socket.on("rentPaid", async(data) => {
        let board = await findBoard(roomId);
        let toPay = getRentPrice(data.rentPay)
        payPlayer(board, data.thisPlayer.socketId, data.rentPay.owner, toPay, roomId)
    })

    socket.on("seeProperties", async(player) => {
        let board = await findBoard(roomId);
        let ownedTiles = await getAllPropertiesOwned(board, player.socketId);

        socket.emit("ownedProperties", ownedTiles)
    })

    socket.on("buyHouse", async(data)=> {
        console.log("buying house")
        let board = await findBoard(roomId)
        let currentPlayer = await findPlayer(board, socket.id)
        let currentPlayerIndex = await findPlayerIndex(board, socket.id)
        let property = data.property
        let propertyInBoard = await findTile(board, property.tileId)
        let propertyInBoardIndex = await findTileIndex(board, property)

        if(propertyInBoard.owner !== currentPlayer.socketId){
            //error not owner
            console.log("house owner err")
            return
        }

        if(currentPlayer.money < propertyInBoard.housePrice){
            //error not enough money
            console.log("house money err")
            return
        }

        currentPlayer.money = currentPlayer.money - propertyInBoard.housePrice
        board.currentPlayer = currentPlayer

        if(propertyInBoard.houses){
            propertyInBoard.houses.push('h')
        } else{
            propertyInBoard.houses = ['h']
        }

        board.players.splice(currentPlayerIndex, 1, currentPlayer);
        board.tileData.splice(propertyInBoardIndex, 1, propertyInBoard)
        console.log(board)
        await board.save()
        io.in(roomId).emit("boardUpdate", {board})
    })

    socket.on("confirmChance", async({boardData, randomChance, thisPlayer})=> {
        let board = await findBoard(roomId);
        let currentPlayer = await findPlayer(board, socket.id)
        let currentPlayerIndex = await findPlayerIndex(board, socket.id)
        chanceCard(randomChance, board, currentPlayer, currentPlayerIndex, socket, roomId)
    })
});

server.listen(port, () => {
    console.log("Server listening on", port)
})