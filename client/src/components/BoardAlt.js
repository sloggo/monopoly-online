import React, {useEffect, useRef, useState} from 'react'
import mapPng from '../assets/map.png'
import playerPng from '../assets/TX Player.png'
import './BoardAlt.scss'
import diceSVG from '../assets/dice.svg'
import PopUp from './PopUp'
let c;

export default function BoardAlt(props) {
    //gameworld states
    const canvasRef = useRef(null)
    const [background, setBackground] = useState({
        image: mapPng,
        offset:{
            x:-576,
            y:-420
        },
        tileSize: 32*2 //2x zoom
    })
    const [playerSprite, setPlayerSprite] = useState({
        image: playerPng
    })
    const [moving, setMoving] = useState(false)

    //network states
    const [visible, setVisible] = useState(props.visible)
    const [boardDataLocal, setBoardDataLocal] = useState(props.boardData)
    const [boardDataLive, setBoardDataLive] = useState(props.boardData)
    const [isLive, setIsLive] = useState(false)
    const [playerTurn, setPlayerTurn] = useState(false)
    const [socketID, setSocketID] = useState(props.socketID)
    const [diceRoll, setDiceRoll] = useState(props.diceRoll)

    useEffect(() => {
        setVisible(props.visible)
        setDiceRoll(props.diceRoll)
        setSocketID(props.socketID)
    }, [props])

    useEffect(()=>{
        onBoardUpdate(props.boardData)
        window.requestAnimationFrame(render)
    }, [props.boardData, boardDataLocal, boardDataLive])

    function onBoardUpdate(newData){
        setBoardDataLive(newData)

        if(newData.currentPlayer.socketId === boardDataLocal.currentPlayer.socketId && newData.currentPlayer.position === boardDataLocal.currentPlayer.position){
            // current player is the same and their in their live position
            setIsLive(true)
            setBoardDataLocal(newData)

            if(newData.currentPlayer.socketId === socketID){
                setPlayerTurn(true)
            } else{
                setPlayerTurn(false)
            }
        } else if(newData.currentPlayer.socketId === boardDataLocal.currentPlayer.socketId && newData.currentPlayer.position !== boardDataLocal.currentPlayer.position){
            // current player is not yet fully updated
            setIsLive(false)
            goTo(newData.currentPlayer.position.x, newData.currentPlayer.position.y)

            if(boardDataLocal.currentPlayer.socketId === socketID){
                setPlayerTurn(true)
            } else{
                setPlayerTurn(false)
            }

        } else{
            // next player
            setIsLive(true)
            setBoardDataLocal(newData)

            if(newData.currentPlayer.socketId === socketID){
                setPlayerTurn(true)
            } else{
                setPlayerTurn(false)
            }
        }

    }

    function getPositionFrom(active, relative){
        let xDifference = active.position.x - relative.position.x
        let yDifference = active.position.y - relative.position.y

        return {x: xDifference*background.tileSize, y: yDifference*background.tileSize}
    }   

    function render(){
        let canvas = canvasRef.current
        canvas.width = 1024
        canvas.height = 700

        c.fillStyle = '#D8F2FF'
        c.fillRect(0, 0, canvas.width, canvas.height)

        const image = new Image()
        image.src = background.image

        const playerImage = new Image()
        playerImage.src = playerSprite.image

        let activePlayer = boardDataLocal.currentPlayer
      
        c.drawImage(image, (-(activePlayer.position.x)*background.tileSize)-background.offset.x, (-(activePlayer.position.y)*background.tileSize-background.offset.y))

        boardDataLocal.players.forEach(plyr=> {
            if(plyr.active){
                c.drawImage(
                    playerImage,
                    0,
                    0,
                    playerImage.width/4,
                    playerImage.height,
                    canvas.width/2,
                    canvas.height/2,
                    playerImage.width/4*2.1,
                    playerImage.height*2.1,
                )
            } else{
                let newPositionRelative = getPositionFrom(activePlayer, plyr)
                let noPeopleOnTile = boardDataLocal.players.filter(plyr => plyr.position.x === plyr.position.x && plyr.position.y === plyr.position.y).length

                c.drawImage(
                    playerImage,
                    0,
                    0,
                    playerImage.width/4,
                    playerImage.height,
                    canvas.width/2 - newPositionRelative.x,
                    canvas.height/2 - newPositionRelative.y,
                    playerImage.width/4*2,
                    playerImage.height*2,
            )
            }
        })

        window.requestAnimationFrame(render)
    }

    function handleUserKey(e){
        let newBoard = {...boardDataLocal}
        let newPlayers = [...newBoard.players]
        let activePlayer = newBoard.players.find(plyr => plyr.socketId === boardDataLocal.currentPlayer.socketId)
        let activePlayerIndex = newPlayers.findIndex(plyr=> plyr.id === activePlayer.id)

        if(e.key === 'w'){
            console.log('w')
            activePlayer.position.y -= 1
            newPlayers.splice(activePlayerIndex, 1, activePlayer)
        }

        if(e.key === 's'){
            console.log('s')
            activePlayer.position.y += 1
            newPlayers.splice(activePlayerIndex, 1, activePlayer)
        }

        if(e.key === 'a'){
            console.log('a')
            activePlayer.position.x -= 1
            newPlayers.splice(activePlayerIndex, 1, activePlayer)
        }

        if(e.key === 'd'){
            console.log('d')
            activePlayer.position.x += 1
            newPlayers.splice(activePlayerIndex, 1, activePlayer)
        }

        newBoard.players = newPlayers
        newBoard.currentPlayer = activePlayer
        setBoardDataLocal(newBoard)
    }

    useEffect(() => {
        c = canvasRef.current.getContext('2d')
        window.addEventListener("keydown", handleUserKey)
        window.requestAnimationFrame(render)
    }, [])

    function goTo(x, y, id){
        console.log(x,y)
        setMoving(true)
        setTimeout(() => {
            let newBoard = {...boardDataLocal}
            let newPlayers = [...newBoard.players]
            let activePlayer = boardDataLocal.players.find(plyr => plyr.socketId === boardDataLocal.currentPlayer.socketId)
            let activePlayerIndex = newPlayers.findIndex(plyr=> plyr.socketId === activePlayer.socketId)

            if(activePlayer.position.x !== x && activePlayer.position.x > x){

                activePlayer.position.x -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                goTo(x,y)
            } else if(activePlayer.position.x !== x && activePlayer.position.x < x){

                activePlayer.position.x += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                goTo(x,y)
            } else if(activePlayer.position.y !== y && activePlayer.position.y > y){

                activePlayer.position.y -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                goTo(x,y)
            } else if(activePlayer.position.y !== y && activePlayer.position.y < y){

                activePlayer.position.y += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                goTo(x,y)
            } else {
                setMoving(false)
                return
            }

            newBoard.players = newPlayers
            newBoard.currentPlayer = activePlayer
            setBoardDataLocal(newBoard)
        }, 100)
    }

    function clickDice(){
        goTo(0,0)
    }

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems:'center', height: '100vh'}}>
        {playerTurn && !moving && <PopUp closeManage={props.closeManage} manageOpen={props.manageOpen} payRent={props.payRent} propertyBuy={props.propertyBuy} declineBuy={props.declineBuy} buyProperty={props.buyProperty} rentPay={props.rentPay}></PopUp>}
        <canvas ref={canvasRef} style={{border: "10px solid white"}}/>
        {playerTurn && !moving && !props.rentPay && !props.propertyBuy && <img src={diceSVG} width={100} onClick={props.rollDice}></img>}
    </div>
  )
}
