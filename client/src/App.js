import './App.css';
import Board from './components/Board';
import { useEffect, useState } from 'react';
import Home from "./components/Home"
import Options from './components/Options'
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001")


function App() {
  const [currentTab, setCurrentTab] = useState("home")
  // network states
  const [playerData, setPlayerData] = useState(null)
  const [boardData, setBoardData] = useState(null)

  const setOptionsTab = () =>{
    setCurrentTab("options")
  }

  const setBoard = () =>{
    setCurrentTab("board")
  }

  const createRoom = () => {
    socket.emit("createRoom", socket.id)
    setCurrentTab("loading")
  }

  const joinRoom = (codeInput) => {
    console.log("Joining room;", codeInput)
    socket.emit("joinRoom", codeInput)
    setCurrentTab("loading")
  }

  const changeTest = () => {
    socket.emit("changeTest", playerData)
  }

  useEffect(() => {
    socket.on("joinedRoom", (data) => {
      setPlayerData(data.player)
      setBoardData(data.board)

      console.log("Joined room;", data.board._id)
      setCurrentTab("waitingroom")
    })

    socket.on("error", (msg) => {
      console.error(msg)
    })
  })

  return (
    <div className="App">
      <Home visible={currentTab === "home"} setOptionsTab={setOptionsTab}></Home>
      <Options visible={currentTab === "options"} createRoom={createRoom} joinRoom={joinRoom} ></Options>
      <Board visible={currentTab === "board"} currentTab={currentTab} playerData={playerData} boardData={boardData} changeTest={changeTest}></Board>
    </div>
  );
}

export default App;
