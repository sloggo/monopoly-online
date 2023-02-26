import './App.css';
import Board from './components/Board';
import io from "socket.io-client";
import { useEffect, useState } from 'react';
const socket = io.connect("http://localhost:3001");

function App() {
  const [roomIdInput, setRoomIdInput] = useState()
  const [roomId, setRoomId] = useState()
  const [log, setLog] = useState([])
  const [roomPlayers, setRoomPlayers] = useState()

  useEffect(() => {
    socket.on("receive-test", (data) =>{
      alert("test")
    })

    socket.on("player-join", (data) =>{
      socket.emit("get-clients-in-room", roomIdInput)
      addLog(data+" joined this room.")
    })

    socket.on("clients-in-room", (clientsInRoom) =>{
      setRoomPlayers(clientsInRoom)
    })
  }, [socket])

  function addLog(data){
    let oldLog = [...log]
    oldLog.push(data)

    setLog(oldLog)
  }

  function changeRoomId(x){
    setRoomIdInput(x.target.value)
  }

  function emitTest(){
    socket.emit("emit-test", {message: "test", roomId})
  }

  function confirmRoomId(){
    socket.emit("change-room", roomIdInput)
    setRoomId(roomIdInput)
    addLog("Joined room "+roomIdInput)
  }

  return (
    <div className="App">
      <h1 onClick={emitTest}>Room {roomId}</h1>
      <p>Players: {roomPlayers}</p>
      <div>
        <input type="text" onChange={(event) => changeRoomId(event)} placeholder="Game Code"></input>
        <button onClick={confirmRoomId}>Confirm</button>
      </div>
      <div>{log.map((item) => {
        return <p>{item}</p>
      })}</div>
    </div>
  );
}

export default App;
