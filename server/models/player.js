const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    ownedTiles: {
        type: Array,
    },
    money: {
        type: Number,
        default: 1000,
    },
    socketId: {
        type: String,
        required: true,
    },
    inRoomId: {
        type: String,
    },
    ready: {
        type: Boolean,
        default: false,
    }
})

module.exports = {playerSchema}