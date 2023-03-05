import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import './WaitingRoom.scss'

export default function WaitingRoom(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)
    const [boardData, setBoardData] = useState(null);
    const [playerData, setPlayerData] = useState(props.playerData)
    const [ready, setReady] = useState(false)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    const clickReady = () => {
        setReady(!ready)
    }

    useEffect(()=>{
        setVisible(props.visible)
        setBoardData(props.boardData)
        setPlayerData(props.playerData)
    }, [props])

  return (
    <AnimatePresence>
      { visible && <motion.div className='home-container' onMouseMove={(ev) => changeMousePos(ev)} transition={{duration:1}} initial={{ y:-3000 }} animate={{ y:-0 }} exit={{ y:2000 }}>
        <div className='ball-blur'>
            <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
        </div>

        {boardData && <h2 className='options-header'>Lobby: {boardData._id}</h2>}

        <div className='players-container'>
            {boardData && boardData.players.map(playerArray => playerArray._id === playerData._id ? <div className='player you'><p>{playerArray.username} - You</p> <div className={ready ? "readyup ready": "readyup"} onClick={clickReady}>Ready Up</div> </div> : <div className='player'>{playerArray.username}</div>)}
        </div>
      </motion.div>}
    </AnimatePresence>
  )
}
