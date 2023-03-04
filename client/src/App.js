import './App.css';
import Board from './components/Board';
import io from "socket.io-client";
import { useEffect, useState } from 'react';
import Home from "./components/Home"

function App() {
  const [currentTab, setCurrentTab] = useState("home")

  const setOptionsTab = () =>{
    setCurrentTab("options")
  }

  return (
    <div className="App">
      <Home visible={currentTab === "home"} setOptionsTab={setOptionsTab}></Home>
    </div>
  );
}

export default App;
