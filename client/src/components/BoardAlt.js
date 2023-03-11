import React, {useEffect, useRef, useState} from 'react'
import mapPng from '../assets/map.png'
import playerPng from '../assets/TX Player.png'
import './BoardAlt.scss'
import diceSVG from '../assets/dice.svg'
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
    const [boardDataLive, setBoardDataLive] = useState(props.boardData)
    const [boardData, setBoardData] = useState(props.boardData)
    const [live, setLive] = useState(true)
    const [playerTurn, setPlayerTurn] = useState(false)
    const [socketID, setSocketID] = useState(props.socketID)
    const [diceRoll, setDiceRoll] = useState(props.diceRoll)

    useEffect(() => {
        setVisible(props.visible)
        setBoardDataLive(props.boardData)
        setDiceRoll(props.diceRoll)
        setSocketID(props.socketID)
    }, [props])

    useEffect(()=>{
        setLive(false)
        if(boardDataLive && boardDataLive.currentPlayer.socketId === socketID){
            setPlayerTurn(true)
        } else{
            setPlayerTurn(false)
        }
        const activePlayer = boardDataLive.currentPlayer.currentTile.tileId
        const tile = boardDataLive.tileData.find(tile => tile.tileId === activePlayer)
        goTo(tile.mapPosition.x, tile.mapPosition.y)
    }, [boardDataLive])

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

        const activePlayer = boardData.players.find(plyr => plyr.socketId === boardData.currentPlayer.socketId)
        c.drawImage(image, (-(activePlayer.position.x)*background.tileSize)-background.offset.x, (-(activePlayer.position.y)*background.tileSize-background.offset.y))

        boardData.players.forEach(plyr=> {
            if(plyr.active){
                c.drawImage(
                    playerImage,
                    0,
                    0,
                    playerImage.width/4,
                    playerImage.height,
                    canvas.width/2,
                    canvas.height/2,
                    playerImage.width/4*2,
                    playerImage.height*2,
                )
            } else{
                let newPositionRelative = getPositionFrom(activePlayer, plyr)
                let noPeopleOnTile = boardData.players.filter(plyr => plyr.position.x === plyr.position.x && plyr.position.y === plyr.position.y).length

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
        let newBoard = {...boardData}
        let newPlayers = [...newBoard.players]
        let activePlayer = newPlayers.find(plyr => plyr.socketId === boardData.currentPlayer.socketId)
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
        setBoardData(newBoard)
    }

    useEffect(() => {
        c = canvasRef.current.getContext('2d')
        window.addEventListener("keydown", handleUserKey)
        window.requestAnimationFrame(render)
    }, [])

    function goTo(x, y){
        console.log(x,y)
        setMoving(true)
        setTimeout(() => {
            let newBoard = {...boardData}
            let newPlayers = [...newBoard.players]
            let activePlayer = newPlayers.find(plyr => plyr.socketId === boardData.currentPlayer.socketId)
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
                setBoardData(boardDataLive)
                setLive(true)
            }

            newBoard.players = newPlayers
            newBoard.currentPlayer = activePlayer
            setBoardData(newBoard)
        }, 100)
    }

    function clickDice(){
        goTo(0,0)
    }

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems:'center', height: '100vh'}}>
        <canvas ref={canvasRef} style={{border: "10px solid white"}}/>
        {playerTurn && !moving && live && <img src={diceSVG} width={100} onClick={props.rollDice}></img>}
    </div>
  )
}
