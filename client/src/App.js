import './App.css';
import Board from './components/Board';
import { useEffect, useState } from 'react';
import Home from "./components/Home"
import Options from './components/Options'
import io from "socket.io-client";
import WaitingRoom from './components/WaitingRoom';
import BoardAlt from './components/BoardAlt';
import PopUp from './components/PopUp';

const socket = io.connect("http://localhost:3001")


function App() {
  const [currentTab, setCurrentTab] = useState("home")
  // network states
  const [thisPlayer, setThisPlayer] = useState(null)
  const [boardData, setBoardData] = useState(null)
  const [socketID, setSocketID] = useState(null)

  const [diceRoll, setDiceRoll] = useState(null)
  const [notification, setNotification] = useState(null)
  const [manageOpen, setManageOpen]= useState(false)
  const [winner, setWinner] = useState(null)

  const confirmChance = (randomChance) => {
    socket.emit("confirmChance", {boardData, randomChance, thisPlayer})
    setNotification(null)
  }

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
    socket.emit("wantsToBuyProperty", notification.property)
    setNotification(null)
  }

  const declineBuy = () => {
    setNotification(null)
    socket.emit("declineBuy", boardData)
  }

  const buyHouse = (property) => {
    console.log('sent')
    socket.emit("buyHouse", {boardData, property, thisPlayer})
  }

  const payRent = () => {
    if(!notification.property) return 
    let prop = notification.property
    socket.emit("rentPaid", {thisPlayer, rentPay: prop})
    setNotification(null)
  }

  const openManage = () => {
    if(!notification){
      socket.emit("seeProperties", thisPlayer)
      console.log("open")
    }
  }

  const closeManage = () => {
    setManageOpen(false)
  }

  const gameOver = () => {
    setCurrentTab("home")
    socket.emit("leaveRoom", {boardData})
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

    socket.off("newNotification")
    socket.on("newNotification", (data) => {
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)

      setBoardData(data.board)
      setThisPlayer(thisPlyr)
      console.log("pay", data.price)
      setNotification(data)
    })

    socket.off("ownedProperties")
    socket.on("ownedProperties", (ownedProperties) => {
      setManageOpen({thisPlayer, ownedProperties})
    })
    
    socket.off("gameOver")
    socket.on("gameOver", (data) => {
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)

      setBoardData(data.board)
      setThisPlayer(thisPlyr)
      console.log(data)
      setNotification(data)
      setWinner(data.winner)
    })

  })

  return (
    <div className="App">
      <Home visible={currentTab === "home"} setOptionsTab={setOptionsTab}></Home>
      <Options visible={currentTab === "options"} createRoom={createRoom} joinRoom={joinRoom} ></Options>
      <WaitingRoom visible={currentTab === "waitingroom"} startGame={startGame} toggleReady={toggleReady} boardData={boardData} thisPlayer={thisPlayer}></WaitingRoom>
      {currentTab === "board" && <BoardAlt winner={winner} visible={currentTab === "board"} confirmChance={confirmChance} buyHouse={buyHouse} closeManage={closeManage} gameOver={gameOver} manageOpen={manageOpen} payRent={payRent} declineBuy={declineBuy} notification={notification} visible={currentTab === "board"} currentTab={currentTab} boardData={boardData} changeTest={changeTest} rollDice={rollDice} socketID={socketID} diceRoll={diceRoll} buyProperty={buyProperty} thisPlayer={thisPlayer} openManage={openManage}></BoardAlt>}
    </div>
  );
}

export default App;
