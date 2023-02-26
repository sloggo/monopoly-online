import './App.css';
import Board from './components/Board';
import io from "socket.io-client";
import { useEffect } from 'react';
const socket = io.connect("http://localhost:3001");

function App() {

  function sendMessage(){
    socket.emit("send-message", {message:"data"})
  }

  useEffect(() => {

    socket.on("receive-message", (data) => {
      alert(data.message)
    })
    
  }, [socket])

  return (
    <div className="App" onClick={sendMessage}>
      <Board></Board>
    </div>
  );
}

export default App;
