import React, { useEffect, useState } from 'react'
import "./Board.scss"
import boardDataFile from "./boardData.json"
import { motion, AnimatePresence } from 'framer-motion'
import diceSVG from '../assets/dice.svg'
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

export default function Board(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)
    const [boardData, setBoardData] = useState(boardDataFile)
    const [playerTurn, setPlayerTurn] = useState(true)
    const [dice, setDice] = useState(null)

    // network states
    const [socket, setSocket] = useState(null)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    const rollDice = () => {
        if(!playerTurn){
            return
        }
        setDice(Math.floor(Math.random() * (6)) + 1)
        setPlayerTurn(false)
    }

    useEffect(() => {
        setVisible(props.visible)
    }, [props])

    useEffect(() => {
    }, [])

  return (
    <AnimatePresence>
        <div className='board-container'>
            <div className='ball-blur' onMouseMove={changeMousePos}>
                <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
            </div>

        {playerTurn ?
        <motion.div className='dice-container' initial={{scale:0.8, rotate: -5}} animate={{scale:1, rotate:5}} transition={{duration:1, repeat: Infinity, repeatType:"reverse"}}>
            <img src={diceSVG} width={100} onClick={rollDice}></img>
            <p>{dice}</p>
        </motion.div>
        :
        <div className='dice-container'>
            <img src={diceSVG} width={100} onClick={rollDice}></img>
            <p>{dice}</p>
        </div>}

            <div className='boardtiles-container' onMouseMove={changeMousePos}>
                    {boardData.map((tile, tileRowIndex) => {
                        if(tile.tileId === null){ // if it is a center piece
                            return <Center key={tileRowIndex}></Center>
                        } else if(tile.type === "tile"){
                            return <Tile tile={tile} key={tileRowIndex}/>
                        } else if(tile.type === "square"){
                            return <Square tile={tile} key={tileRowIndex}/>
                        }
                    })}
            </div>
        </div>
    </AnimatePresence>
  );
}

    function Square(props) {
      return (
        <div className='square'>{props.tile.name}
        </div>
      );
    }


    function Tile(props) {
        return (
            <>
            {
                <div className={`tile ${props.tile.orientation}`}>
                    <div className={`colour-bar ${props.tile.colour}`}></div>
                    <div className='name-info'>
                        <p className='bold-text'>{props.tile.name}</p>
                        {props.tile.price ? <p>{props.tile.price}$</p> : null}
                    </div>
                </div>
            }
            </>
          );
      }

    function Center({}) {
        return(
            <div className='center'></div>
        )
    }
