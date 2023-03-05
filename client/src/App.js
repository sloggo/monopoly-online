import './App.css';
import Board from './components/Board';
import { useEffect, useState } from 'react';
import Home from "./components/Home"
import Options from './components/Options'
import io from "socket.io-client";

const socketio = io.connect("http://localhost:3001");

function App() {
  const [currentTab, setCurrentTab] = useState("home")
  // network states
  const [socket, setSocket] = useState(null)

  const setOptionsTab = () =>{
    setCurrentTab("options")
  }

  const setBoard = () =>{
    setCurrentTab("board")
  }

  const createRoom = () => {
    socketio.emit("createRoom", socket)
  }

  useEffect(() => {
    setSocket(socketio.id)
    socketio.on("playerUpdate", ({playerObj}) => {
      console.log("pl")
    })
  })

  return (
    <div className="App">
      <Home visible={currentTab === "home"} setOptionsTab={setOptionsTab}></Home>
      <Options visible={currentTab === "options"} createRoom={createRoom} setBoard={setBoard} ></Options>
      <Board visible={currentTab === "board"} currentTab={currentTab}></Board>
    </div>
  );
}

export default App;
