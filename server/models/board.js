const mongoose = require("mongoose");
const {playerSchema} = require("./player");
const boardData = require("../boardData.json")

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
        default: boardData,
    },
    joinable: {
        type: Boolean,
        default: true,
    },
    public: {
        type: Boolean,
        default: true,
    }
})

const Board = mongoose.model("Board", boardSchema)

module.exports = {Board}