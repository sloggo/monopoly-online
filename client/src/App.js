import './App.css';
import Board from './components/Board';
import { useEffect, useState } from 'react';
import Home from "./components/Home"
import Options from './components/Options'
import io from "socket.io-client";


function App() {
  const [currentTab, setCurrentTab] = useState("home")
  // network states
  const [socket, setSocket] = useState(io.connect("http://localhost:3001"))

  const setOptionsTab = () =>{
    setCurrentTab("options")
  }

  const setBoard = () =>{
    setCurrentTab("board")
  }

  const createRoom = () => {
    socket.emit("createRoom", socket.id)
  }

  useEffect(() => {
    socket.on("playerUpdate", ({playerObj}) => {
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
