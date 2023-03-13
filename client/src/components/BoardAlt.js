import React, {useEffect, useRef, useState} from 'react'
import mapPng from '../assets/monopoly-city-map.png'
import playerPng from '../assets/player1.png'
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
            x:-505,
            y:-420
        },
        tileSize: 16*4 //4x zoom
    })
    const [playerSprite, setPlayerSprite] = useState({
        image: playerPng
    })
    const [moving, setMoving] = useState(false)
    let frameNum = 0

    //network states
    const [visible, setVisible] = useState(props.visible)
    const [boardDataLocal, setBoardDataLocal] = useState(props.boardData)
    const [boardDataLive, setBoardDataLive] = useState(props.boardData)
    const [isLive, setIsLive] = useState(false)
    const [playerTurn, setPlayerTurn] = useState(false)
    const [socketID, setSocketID] = useState(props.socketID)
    const [diceRoll, setDiceRoll] = useState(props.diceRoll)
    const [movingData, setMovingData] = useState({
        up: false,
        down: false,
        left: false,
        right: false,
        frame: 0
    })
    const [progressingToTile, setProgessingToTile]=useState(false)

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
            if(!moving) progressToTile(boardDataLocal.currentPlayer.currentTile.tileId, boardDataLive.currentPlayer.currentTile.tileId)

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

    async function progressToTile(originalTile, finalTile){
        let originalTileOb = boardDataLocal.tileData.find(tile => tile.tileId === originalTile)

        setTimeout(()=>{
            if(progressingToTile){
                progressToTile(originalTile, finalTile)
                return
            } else{
                setMoving(true)
                let nextTile = boardDataLocal.tileData.find(tile => tile.tileId === originalTile+1)
                goTo(nextTile.mapPosition.x, nextTile.mapPosition.y)
                progressToTile(originalTile+1, finalTile)
            }
        }, 100)
    }

    function render(){
        let canvas = canvasRef.current
        canvas.width = 1024
        canvas.height = 700

        const image = new Image()
        image.src = background.image

        const playerImage = new Image()
        playerImage.src = playerSprite.image

        let activePlayer = boardDataLocal.currentPlayer
      
        c.drawImage(image, (-(activePlayer.position.x)*background.tileSize)-background.offset.x, (-(activePlayer.position.y)*background.tileSize-background.offset.y))

        boardDataLocal.players.forEach(plyr=> {
            if(plyr.socketId === activePlayer.socketId){
                if(moving){
                    let data = getAnimationFrame(playerImage)
                    c.drawImage(
                        playerImage,
                        data.startX,
                        data.startY,
                        data.endX,
                        data.endY,
                        canvas.width/2,
                        canvas.height/2,
                        16*3,
                        32*3,
                    )
                } else{
                    c.drawImage(
                        playerImage,
                        (playerImage.width/24)*3,
                        0,
                        16,
                        32,
                        canvas.width/2,
                        canvas.height/2,
                        16*3,
                        32*3
                        )
                    }
            } else{
                let newPositionRelative = getPositionFrom(activePlayer, plyr)
                let noPeopleOnTile = boardDataLocal.players.filter(plyr => plyr.position.x === plyr.position.x && plyr.position.y === plyr.position.y).length
                c.drawImage(
                    playerImage,
                    (playerImage.width/24)*3,
                    0,
                    16,
                    32,
                    canvas.width/2 - newPositionRelative.x,
                    canvas.height/2 - newPositionRelative.y,
                    16*3,
                    32*3
                    )
                }
        })

        window.requestAnimationFrame(render)
    }

    function getAnimationFrame(playerImage){
        frameNum = frameNum + 1
        let imageData={};
        if(movingData.right){
            imageData = {
                startY: (playerImage.height/7)*2,
                startX: (playerImage.width/24)*(frameNum%5),
                endY: 32,
                endX: 16,
            }
        } else if(movingData.up){
            imageData = {
                startY: (playerImage.height/7)*2,
                startX: (playerImage.width/24)*((frameNum%5)+6),
                endY: 32,
                endX: 16,
            }
        } else if(movingData.left){
            imageData = {
                startY: (playerImage.height/7)*2,
                startX: (playerImage.width/24)*((frameNum%5)+12),
                endY: 32,
                endX: 16,
            }
            return imageData
        } else if(movingData.down){
            imageData = {
                startY: (playerImage.height/7)*2,
                startX: (playerImage.width/24)*((frameNum%5)+18),
                endY: 32,
                endX: 16,
            }
        }else{
            imageData = {
                startX: (playerImage.width/24)*3,
                startY: 0,
                endY: 32,
                endX: 16,
            }
        }

        return imageData
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

    function goTo(x, y, tileId){
        console.log(x,y)
        setProgessingToTile(true)
        setTimeout(() => {
            let newBoard = {...boardDataLocal}
            let newPlayers = [...newBoard.players]
            let activePlayer = boardDataLocal.players.find(plyr => plyr.socketId === boardDataLocal.currentPlayer.socketId)
            let activePlayerIndex = newPlayers.findIndex(plyr=> plyr.socketId === activePlayer.socketId)

            if(activePlayer.position.x !== x && activePlayer.position.x > x){

                activePlayer.position.x -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                
                setMovingData({
                    up: false,
                    down: false,
                    left: true,
                    right: false,
                })
                goTo(x,y)
            } else if(activePlayer.position.x !== x && activePlayer.position.x < x){

                activePlayer.position.x += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setMovingData({
                    up: false,
                    down: false,
                    left: false,
                    right: true,
                })
                goTo(x,y)
            } else if(activePlayer.position.y !== y && activePlayer.position.y > y){

                activePlayer.position.y -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setMovingData({
                    up: true,
                    down: false,
                    left: false,
                    right: false,
                })
                goTo(x,y)
            } else if(activePlayer.position.y !== y && activePlayer.position.y < y){

                activePlayer.position.y += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setMovingData({
                    up: false,
                    down: true,
                    left: false,
                    right: false,
                })
                goTo(x,y)
            } else {
                setMovingData({
                    up: false,
                    down: false,
                    left: false,
                    right: false,
                })
                setProgessingToTile(null)
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
