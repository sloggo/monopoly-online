import './Options.scss'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"

export default function Options(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    useEffect(() =>{
        setVisible(props.visible)
      }, [props])
      
    const enterGameCode = () => {
        props.setBoard()
    }

  return (
    <AnimatePresence>
      { visible && <motion.div className='home-container' onMouseMove={(ev) => changeMousePos(ev)} transition={{duration:1}} initial={{ y:-3000 }} animate={{ y:-0 }} exit={{ y:2000 }}>
        <div className='ball-blur'>
            <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
        </div>

        <h2 className='options-header'>Let's get straight into a game!</h2>

        <input className='start-playing' placeholder='Enter a Game Code!' onClick={enterGameCode}></input>
      </motion.div>}
    </AnimatePresence>
  )
}
