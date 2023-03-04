import './App.css';
import Board from './components/Board';
import io from "socket.io-client";
import { useEffect, useState } from 'react';
import Home from "./components/Home"

function App() {

  return (
    <div className="App">
      <Home></Home>
    </div>
  );
}

export default App;
