const mongoose = require("mongoose");
const {Board} = require("../models/board")
const uri = "mongodb+srv://sloggo:admin@monopolyonline.pj4zqbf.mongodb.net/?";
mongoose.connect(uri)

mongoose.connection.on('connected', async function () {  
    console.log('Mongoose connected, cleared boards');
    await Board.deleteMany()
  }); 
