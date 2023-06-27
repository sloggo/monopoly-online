const mongoose = require("mongoose");
const {Board} = require("../models/board")

const uri = "mongodb+srv://sloggo:sloggo@monopolyonline.pj4zqbf.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri)

mongoose.connection.on('connected', async function () {  
    console.log('Mongoose connected, cleared boards');
    await Board.deleteMany()
  }); 
