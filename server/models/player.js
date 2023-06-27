const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    money: {
        type: Number,
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
    },
    currentTile:{
        type: Object,
        default: {
            "tileId": 0,
            "type": "square",
            "colour": null,
            "name": "Go!",
            "special": true,
            "price": 200
        },
    },
    position: {
        type: Object,
        default: {
            "x": 59,
            "y": 100
        }
    },
    bankrupt: {
        type: Boolean,
        default: false
    }
})

module.exports = {playerSchema}