import './App.css';
import Board from './components/Board';
import { useEffect, useState } from 'react';
import Home from "./components/Menus/Home"
import Options from './components/Menus/Options'
import io from "socket.io-client";
import WaitingRoom from './components/WaitingRoom';
import Account from './components/Menus/Account';
import { BrowserRouter, Routes, Route } from 'react-router-dom';



const socket = io.connect("http://localhost:3001")


function App() {
  const [currentTab, setCurrentTab] = useState("home")
  // network states
  const [thisPlayer, setThisPlayer] = useState(null)
  const [account, setAccount] = useState(null)
  const [boardData, setBoardData] = useState(null)
  const [socketID, setSocketID] = useState(null)

  const [diceRoll, setDiceRoll] = useState(null)
  const [propertyBuy, setPropertyBuy] = useState(null)
  const [rentPay, setRentPay] = useState(null)
  const [manageOpen, setManageOpen]= useState(false)

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

  const clickAccount = () => {
    setCurrentTab("account")
  }

  const setAccountState = (state) => {
    setAccount(state)
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

  const openManage = () => {
    if(!rentPay && !propertyBuy){
      socket.emit("seeProperties", thisPlayer)
      console.log("open")
    }
  }

  const closeManage = () => {
    setManageOpen(false)
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
      setCurrentTab("home")
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

    socket.off("ownedProperties")
    socket.on("ownedProperties", (ownedProperties) => {
      setManageOpen({thisPlayer, ownedProperties})
    })

  })

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home clickAccount={clickAccount} setOptionsTab={setOptionsTab}></Home>}/>
          <Route path='/games' element={<Options createRoom={createRoom} joinRoom={joinRoom} ></Options>}/>
          <Route path='/playing' element={<Board closeManage={closeManage} manageOpen={manageOpen} payRent={payRent} declineBuy={declineBuy} rentPay={rentPay} propertyBuy={propertyBuy} visible={currentTab === "board"} currentTab={currentTab} boardData={boardData} changeTest={changeTest} rollDice={rollDice} socketID={socketID} diceRoll={diceRoll} buyProperty={buyProperty} thisPlayer={thisPlayer} openManage={openManage}></Board>}/>
          <Route path='/waitingroom' element={<WaitingRoom startGame={startGame} toggleReady={toggleReady} boardData={boardData} thisPlayer={thisPlayer}></WaitingRoom>}/>
          <Route path='/account' element={<Account setAccount={setAccountState} account={account}></Account>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
