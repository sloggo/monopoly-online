const express = require("express")
const mongoose = require("mongoose");
const router = express.Router()
const {Board} = require("../models/board")
const db = require("../models/mongodb")

router
    .get("/", async(req, res) => {
        let games = await Board.find({joinable: true})
        res.send(games)
    })

module.exports=router
