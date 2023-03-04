const express = require("express")();
const cors = require("cors");
const http = require("http").createServer(express);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const Board = require("./models/board");
const {Player} = require("./models/player");

express.use(cors());
const uri = "mongodb+srv://sloggo:admin@monopolyonline.pj4zqbf.mongodb.net/?"

io.on('connection', function (socket) {
    console.log(`New connection: ${socket.id}`);

    socket.on('disconnect', () => console.log(`Connection left (${socket.id})`));
});

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(uri);
    console.log("Connected to mongoDB")
  }