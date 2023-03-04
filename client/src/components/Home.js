import React, { useEffect, useState } from 'react'
import './Home.scss'
import { motion, AnimatePresence } from "framer-motion"

export default function Home(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    const pressPlay = (ev) => {
      props.setOptionsTab()
    }

    useEffect(() =>{
      setVisible(props.visible)
    }, [props])

  return (
    <AnimatePresence>
      { visible && <motion.div className='home-container' onMouseMove={(ev) => changeMousePos(ev)} transition={{duration:.5}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ y:2000 }}>
        <div className='ball-blur'>
            <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
        </div>

        <div className='home-header'>
          <p>Home</p>
          
          <div className='text-holder'>
            <h1 className='home-header'>monopoly</h1>
            <motion.h1 className='home-header' initial={{x: 0, y: 100}} animate={{x:0, y:0}} transition={{delay:.3, duration:1}}>online</motion.h1>
          </div>

          <p>Account</p>
        </div>

        <div className='start-playing' onClick={pressPlay}>Start Playing</div>
      </motion.div>}
    </AnimatePresence>
  )
}
