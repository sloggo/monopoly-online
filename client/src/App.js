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

  useEffect(() => {
    console.log(boardData)
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
      console.log("update board")
      let thisPlyr = data.board.players.find(player => player.socketId === socketID)
      setBoardData(data.board)
      setThisPlayer(thisPlyr)
    })
  })

  return (
    <div className="App">
      <Home visible={currentTab === "home"} setOptionsTab={setOptionsTab}></Home>
      <Options visible={currentTab === "options"} createRoom={createRoom} joinRoom={joinRoom} ></Options>
      <Board visible={currentTab === "board"} currentTab={currentTab} boardData={boardData} changeTest={changeTest}></Board>
      <WaitingRoom visible={currentTab === "waitingroom"} toggleReady={toggleReady} boardData={boardData} thisPlayer={thisPlayer}></WaitingRoom>
    </div>
  );
}

export default App;
