const mongoose = require("mongoose")
const uri = "mongodb+srv://sloggo:admin@monopolyonline.pj4zqbf.mongodb.net/?";
mongoose.connect(uri)

mongoose.connection.on('connected', function () {  
    console.log('Mongoose connected');
  }); 