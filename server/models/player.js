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
            "x": 23,
            "y": 15
        }
    }
})

module.exports = {playerSchema}