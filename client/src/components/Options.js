import './Options.scss'
import axios from 'axios'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"

export default function Options(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)
    const [codeInput, setCodeInput] = useState(null)
    const [games, setGames] = useState(null)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    useEffect(() =>{
        setVisible(props.visible)
      }, [props])

    useEffect(() => {
      async function fetchGames(){
        return await axios.get("http://localhost:3001/games").then((res) => {
          setGames(res.data)
        })
      }

      fetchGames()
    }, [props])
      
    const enterGameCode = (codeInput) => {
        props.joinRoom(codeInput)
    }

    const updateCodeInput = (ev) => {
      setCodeInput(ev.target.value)
    }

    const keyDownHandle = (ev) => {
      if(ev.key === 'Enter'){
        enterGameCode(codeInput)
      }
    }

  return (
    <AnimatePresence>
      { visible && <motion.div className='home-container' onMouseMove={(ev) => changeMousePos(ev)} transition={{duration:1}} initial={{ y:-3000 }} animate={{ y:-0 }} exit={{ y:2000 }}>
        <div className='ball-blur'>
            <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
        </div>

        {games && games.map(game => {
          return <p style={{zIndex: 15}}onClick={(e) => enterGameCode(game._id)}>{game._id} {game.players.map(player => <p>{player.username}</p>)}</p>
        })}

        <h2 className='options-header'>Let's get straight into a game!</h2>

        <input className='start-playing' placeholder='Enter a Game Code!' onChange={updateCodeInput} onKeyDown={keyDownHandle}></input>
        <div className='start-playing create' onClick={props.createRoom}>Create a Room</div>
      </motion.div>}
    </AnimatePresence>
  )
}
