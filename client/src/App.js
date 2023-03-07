import './App.css';
import Board from './components/Board';
import { useEffect, useState } from 'react';
import Home from "./components/Home"
import Options from './components/Options'
import io from "socket.io-client";
import WaitingRoom from './components/WaitingRoom';

const socket = io.connect("http://localhost:3001")


function App() {
  const [currentTab, setCurrentTab] = useState("home")
  // network states
  const [thisPlayer, setThisPlayer] = useState(null)
  const [boardData, setBoardData] = useState(null)
  const [socketID, setSocketID] = useState(null)

  const [diceRoll, setDiceRoll] = useState(null)
  const [propertyBuy, setPropertyBuy] = useState(null)
  const [rentPay, setRentPay] = useState(null)

  const setOptionsTab = () =>{
    setCurrentTab("options")
  }

  const createRoom = () => {
    socket.emit("createRoom", socketID)
    setCurrentTab("loading")
  }

  const joinRoom = (codeInput) => {
    console.log("Joining room;", codeInput)
    socket.emit("joinRoom", codeInput)
    setCurrentTab("loading")
  }

  const changeTest = () => {
    const playerData = boardData.players.find(player => player._id === thisPlayer._id)
    socket.emit("changeTest", playerData)
  }

  const toggleReady = () => {
    socket.emit("toggleReady", {boardData})
  }
  
  const startGame = () => {
    socket.emit("startGame", {boardData})
  }

  const rollDice = () => {
    socket.emit("rollDice", {boardData})
  }

  const buyProperty = () => {
    socket.emit("wantsToBuyProperty", propertyBuy)
    setPropertyBuy(null)
  }

  const declineBuy = () => {
    setPropertyBuy(null)
    socket.emit("declineBuy", boardData)
  }

  const payRent = () => {
    setRentPay(null)
    socket.emit("rentPaid", {thisPlayer, rentPay})
  }

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id)
    })

    socket.on("joinedRoom", (data) => {
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)
      setThisPlayer(thisPlyr)
      setBoardData(data.board)

      console.log("Joined room;", data.board._id)
      setCurrentTab("waitingroom")
    })

    socket.on("error", (msg) => {
      console.error(msg)
    })

    socket.on("boardUpdate", (data) =>{
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)
      setBoardData(data.board)
      setThisPlayer(thisPlyr)

      if(data.diceRoll){
        setDiceRoll(data.diceRoll)
      }
    })

    socket.on("gameStarted", (data) => {
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)
      setBoardData(data.board)
      setThisPlayer(thisPlyr)

      setCurrentTab("board")
    })

    socket.off("buyProperty")
    socket.on("buyProperty", (data) => {
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)
      setBoardData(data.board)
      setThisPlayer(thisPlyr)
      console.log("buy?", data.property)
      setPropertyBuy(data.property)
    })

    socket.off("payRent")
    socket.on("payRent", (data) => {
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)
      setBoardData(data.board)
      setThisPlayer(thisPlyr)
      console.log("pay", data.property.price*0.1)
      setRentPay(data.property)
    })

  })

  return (
    <div className="App">
      <Home visible={currentTab === "home"} setOptionsTab={setOptionsTab}></Home>
      <Options visible={currentTab === "options"} createRoom={createRoom} joinRoom={joinRoom} ></Options>
      <Board payRent={payRent} declineBuy={declineBuy} rentPay={rentPay} propertyBuy={propertyBuy} visible={currentTab === "board"} currentTab={currentTab} boardData={boardData} changeTest={changeTest} rollDice={rollDice} socketID={socketID} diceRoll={diceRoll} buyProperty={buyProperty}></Board>
      <WaitingRoom visible={currentTab === "waitingroom"} startGame={startGame} toggleReady={toggleReady} boardData={boardData} thisPlayer={thisPlayer}></WaitingRoom>
    </div>
  );
}

export default App;
