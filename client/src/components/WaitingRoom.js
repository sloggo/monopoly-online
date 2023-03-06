import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import './WaitingRoom.scss'

export default function WaitingRoom(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)
    const [boardData, setBoardData] = useState(null);
    const [thisPlayer, setThisPlayer] = useState(props.thisPlayer)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    useEffect(()=>{
        setVisible(props.visible)
        setBoardData(props.boardData)
        setThisPlayer(props.thisPlayer)
    }, [props])

  return (
    <AnimatePresence>
      { visible && <motion.div className='home-container' onMouseMove={(ev) => changeMousePos(ev)} transition={{duration:1}} initial={{ y:-3000 }} animate={{ y:-0 }} exit={{ y:2000 }}>
        <div className='ball-blur'>
            <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
        </div>

        {boardData && <h2 className='options-header'>Lobby: {boardData._id}</h2>}

        <div className='players-container'>
            {boardData.players && boardData.players.map(playerArray => playerArray._id === thisPlayer._id ? <div className='player you' key={playerArray._id}><p>{playerArray.username} - You</p> <div className={playerArray.ready ? "readyup ready": "readyup"} onClick={props.toggleReady}>Ready Up</div> </div> : <div className='player' key={playerArray._id}><p>{playerArray.username}</p> <div className={playerArray.ready ? "readyup-dot ready": "readyup-dot"}></div></div>)}
        </div>

        {((boardData.players.filter(player => player.ready === true).length === boardData.players.length) && boardData.players.length > 1) ?
        boardData.players[0] === thisPlayer ? <div className='readyup ready' onClick={props.startGame}>Start Game</div> : <p className='status-text ready'>All players are ready!</p>
        : <p className='status-text'>Waiting for everyone to ready up...</p>}
      </motion.div>}
    </AnimatePresence>
  )
}
