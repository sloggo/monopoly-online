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

        <div className='text-holder'>
          <h1 className='home-header'>monopoly</h1>
          <motion.h1 className='home-header' initial={{x: 0, y: 100}} animate={{x:0, y:0}} transition={{delay:.3, duration:1}}>online</motion.h1>
        </div>

        <div className='start-playing'>Start Playing</div>
    </div>
  )
}
