import './App.css';
import Board from './components/Board';
import io from "socket.io-client";
import { useEffect, useState } from 'react';
const socket = io.connect("http://localhost:3001");

function App() {
  const [selectingRoom, setSelectingRoom] = useState(true)
  const [roomIdInput, setRoomIdInput] = useState()
  const [roomId, setRoomId] = useState()
  const [log, setLog] = useState([])
  const [roomPlayers, setRoomPlayers] = useState()
  const [name, setName] = useState("Player")

  // useEffect(() => {
  //   socket.on("receive-test", (data) =>{
  //     alert("test")
  //   })

  //   socket.on("player-join", (data) =>{
  //     addLog(data+" joined this room.")
  //   })

  //   socket.on("clients-in-room", (clientsInRoom) =>{
  //     setRoomPlayers(clientsInRoom)
  //   })
  // }, [socket])

  // function addLog(data){
  //   let oldLog = [...log]
  //   oldLog.push(data)

  //   setLog(oldLog)
  // }

  // function changeRoomId(x){
  //   setRoomIdInput(x.target.value)
  // }

  // function changeName(x){
  //   setName(x.target.value)
  // }

  // function emitTest(){
  //   socket.emit("emit-test", {message: "test", roomId})
  // }

  // function confirmRoomId(){
  //   socket.emit("change-room", {name, roomIdInput})
  //   setRoomId(roomIdInput)
  //   addLog("Joined room "+roomIdInput)
  //   setSelectingRoom(false)
  // }

  return (
    <div className="App">
      {/* <div>
        <h1 onClick={emitTest}>Room {roomId}</h1>
        <h2 onClick={emitTest}>{name}</h2>
        <p>Players: {roomPlayers}</p>
        {selectingRoom &&<div>
          <input type="text" onChange={(event) => changeName(event)} placeholder="Username"></input>
          <input type="text" onChange={(event) => changeRoomId(event)} placeholder="Game Code"></input>
          <button onClick={confirmRoomId}>Confirm</button>
        </div>}
        <div>{log.map((item) => {
          return <p>{item}</p>
        })}</div>
      </div> */}
      <Board></Board>
    </div>
  );
}

export default App;
