import React, { useEffect, useState } from 'react'
import "./Board.scss"
import boardDataFile from "./boardData.json"
import playerInfoBackground from "../assets/Cyan/playerInfoBack.png"
import { motion, AnimatePresence } from 'framer-motion'

export default function Board(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)
    const [boardData, setBoardData] = useState(boardDataFile)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    useEffect(() =>{
        console.log(boardData)
    }, [boardData])

    useEffect(() => {
        setVisible(props.visible)
    }, [props])

  return (
    <AnimatePresence>
        <div className='board-container'>
            <div className='ball-blur' onMouseMove={changeMousePos}>
                <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
            </div>

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
