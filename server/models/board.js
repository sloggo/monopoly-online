const mongoose = require("mongoose");
const {playerSchema} = require("./player");

const boardSchema = new mongoose.Schema({
    players: [playerSchema],
    numPlayers: {
        type: Number,
        default: 4,
    },
    currentPlayer: {
        type: Object,
        required: true,
    },
    tileData: {
        type: Array,
        required: true,
    }
})

const Board = mongoose.model("Board", boardSchema)

module.exports = Board