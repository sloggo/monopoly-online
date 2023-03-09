const express = require("express")
const router = express.Router()
const Board = require("../models/board")
const db = require("../models/mongodb")

router
    .get("/", (req, res) => {
        console.log('received')
        res.send("blah")
    })

module.exports=router
