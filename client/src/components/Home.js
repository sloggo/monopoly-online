import React, { useState } from 'react'
import './Home.scss'
import { motion } from "framer-motion"

export default function Home() {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    const changeMousePos = (ev) =>{
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

  return (
    <div className='home-container' onMouseMove={(ev) => changeMousePos(ev)}>
        <div className='ball-blur'>
            <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 250, y: mousePosition.y - 250}} transition={{ duration: .05, type: "tween"  }}/>
        </div>

        <h1>Monopoly</h1>
    </div>
  )
}
