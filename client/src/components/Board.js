import React, { useEffect, useState } from 'react'
import "./Board.scss"
import boardDataFile from "./boardData.json"
import PopUp from './PopUp'
import { motion, AnimatePresence } from 'framer-motion'
import diceSVG from '../assets/dice.svg'
import PlayerInfo from './PlayerInfo'

export default function Board(props) {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [visible, setVisible] = useState(props.visible)
    const [boardData, setBoardData] = useState(props.boardData)
    const [playerTurn, setPlayerTurn] = useState(false)
    const [playerData, setPlayerData] = useState(props.playerData)
    const [socketID, setSocketID] = useState(props.socketID)
    const [diceRoll, setDiceRoll] = useState(props.diceRoll)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    useEffect(() => {
        setVisible(props.visible)
        setBoardData(props.boardData)
        setPlayerData(props.playerData)
        setDiceRoll(props.diceRoll)
        setSocketID(props.socketID)
    }, [props])

    useEffect(()=>{
        if(boardData && boardData.currentPlayer.socketId === socketID){
            setPlayerTurn(true)
        } else{
            setPlayerTurn(false)
        }
    }, [boardData])

  return (
    <AnimatePresence>
        {visible && <div className='board-container'>
            <div className='ball-blur' onMouseMove={changeMousePos}>
                <motion.div className='ball-of-colour' animate={{x: mousePosition.x - 200, y: mousePosition.y - 200}} transition={{ duration: .05, type: "tween" }}/>
            </div>
        
        <PopUp closeManage={props.closeManage} manageOpen={props.manageOpen} payRent={props.payRent} propertyBuy={props.propertyBuy} declineBuy={props.declineBuy} buyProperty={props.buyProperty} rentPay={props.rentPay}></PopUp>

        {playerTurn ?
        <motion.div className='dice-container' initial={{scale:0.9, rotate: -3}} animate={{scale:0.9, rotate:3}} transition={{duration:1, repeat: Infinity, repeatType:"reverse"}}>
            <img src={diceSVG} width={100} onClick={props.rollDice}></img>
            <p>{diceRoll}</p>
        </motion.div>
        :
        <div className='dice-container'>
            <img src={diceSVG} width={100} onClick={props.rollDice}></img>
            <p>{diceRoll}</p>
        </div>}

            <div className='boardtiles-container' onMouseMove={changeMousePos}>
                    {boardData && boardData.tileData.map((tile, tileRowIndex) => {
                        if(tile.tileId === null){ // if it is a center piece
                            return <Center key={tileRowIndex}></Center>
                        } else if(tile.type === "tile"){
                            return <Tile tile={tile} key={tileRowIndex}/>
                        } else if(tile.type === "square"){
                            return <Square tile={tile} key={tileRowIndex}/>
                        }
                    })}
            </div>

            <div className='players-container'>{boardData.players.map(player => {
            return (
                <PlayerInfo openManage={props.openManage} boardData={boardData}player={player} thisPlayer={props.thisPlayer} playerTurn={playerTurn}></PlayerInfo>
            )
        })}</div>
        </div>}
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
