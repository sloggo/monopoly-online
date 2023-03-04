import './App.css';
import Board from './components/Board';
import io from "socket.io-client";
import { useEffect, useState } from 'react';
import Home from "./components/Home"
import Options from './components/Options'

function App() {
  const [currentTab, setCurrentTab] = useState("home")

  const setOptionsTab = () =>{
    setCurrentTab("options")
  }

  const setBoard = () =>{
    setCurrentTab("board")
  }

  return (
    <div className="App">
      <Home visible={currentTab === "home"} setOptionsTab={setOptionsTab}></Home>
      <Options visible={currentTab === "options"} setBoard={setBoard} ></Options>
      <Board visible={currentTab === "board"} currentTab={currentTab}></Board>
    </div>
  );
}

export default App;
