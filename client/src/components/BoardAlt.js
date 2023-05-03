import React, {useEffect, useRef, useState} from 'react'
import mapPng from '../assets/monopoly-city-map.png'
import playerPng from '../assets/player1.png'
import './BoardAlt.scss'
import diceSVG from '../assets/dice.svg'
import PopUp from './PopUp'
import PlayerInfo from './PlayerInfo'
let c;

export default function BoardAlt(props) {
    //gameworld states
    const canvasRef = useRef(null)
    const [background, setBackground] = useState({
        image: mapPng,
        offset:{
            x:-505/1024,
            y:-520/700
        },
        tileSize: 16*4, //4x zoom
    })
    const [playerSprite, setPlayerSprite] = useState({
        image: playerPng
    })
    const [moving, setMoving] = useState(false)
    let frameNum = 0
    const [canvasSize, setCanvasSize] = useState({x: window.innerWidth*0.6, y: window.innerWidth*0.6*0.68359375})

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
    const [progressingToTile, setProgessingToTile]=useState(null)

    useEffect(() => {
        setVisible(props.visible)
        setDiceRoll(props.diceRoll)
        setSocketID(props.socketID)
    }, [props])

    useEffect(()=>{
        onBoardUpdate(props.boardData)
        window.requestAnimationFrame(render)
    }, [props.boardData, boardDataLocal, boardDataLive])

    useEffect(()=> {
        setCanvasSize({x: window.innerWidth*0.6, y: window.innerWidth*0.6*0.68359375})
    }, [window])

    function buyHouse(property){
        console.log('board')
        props.buyHouse(property)
    }

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

            if(boardDataLocal.currentPlayer.socketId === socketID){
                setPlayerTurn(true)
            } else{
                setPlayerTurn(false)
            }

            let localTile = boardDataLocal.currentPlayer.currentTile.tileId
            let liveTile = newData.currentPlayer.currentTile.tileId
            setMoving(true)
            console.log(localTile,liveTile)
            progressToTile(localTile, liveTile)

        } else{
            // next player
            setMoving(false)
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
        if(boardDataLocal.currentPlayer.position === boardDataLive.currentPlayer.position){
            return
        }
        let origTile = boardDataLocal.tileData.find(tile => tile.tileId === originalTile)
        let newTile = boardDataLocal.tileData.find(tile => tile.tileId === originalTile+1)
        console.log(originalTile, finalTile)

        if(originalTile === finalTile){
            //fully finished
            console.log("fully finished")
            setMoving(false)
            setProgessingToTile(null)
            return
        }
        
        if(progressingToTile && (progressingToTile.status === 'finished' && newTile.mapPosition.x === progressingToTile.x && newTile.mapPosition.y === progressingToTile.y)){
            console.log("tile done")
            progressToTile(originalTile+1, finalTile)
            return
        } else if(!progressingToTile){
            // new initialisation
            console.log("tile started from null")
            goTo(newTile.mapPosition.x, newTile.mapPosition.y, originalTile, finalTile)
        } else if((progressingToTile.status === 'finished' && (newTile.mapPosition.x !== progressingToTile.x || newTile.mapPosition.y !== progressingToTile.y))){
            // finished last tile
            console.log("tile started")
            goTo(newTile.mapPosition.x, newTile.mapPosition.y, originalTile, finalTile)
        } else{
            // moving
            console.log("still moving")
        }
    }

    useEffect(()=> {
        if(progressingToTile){
            console.log(progressingToTile)
            progressToTile(progressingToTile.tileId, progressingToTile.finalTile)
        }
    }, [progressingToTile])

    function render(){
        let canvas = canvasRef.current
        canvas.width = canvasSize.x
        canvas.height = canvasSize.y

        const image = new Image()
        image.src = background.image

        const playerImage = new Image()
        playerImage.src = playerSprite.image

        let activePlayer = boardDataLocal.currentPlayer
      
        c.drawImage(image, (-(activePlayer.position.x)*background.tileSize)-canvas.width*background.offset.x, (-(activePlayer.position.y)*background.tileSize-canvas.height*background.offset.y))

        boardDataLocal.players.forEach(plyr=> {
            if(plyr.socketId === activePlayer.socketId){
                if(moving && (movingData)){
                    let data = getAnimationFrame(playerImage)
                    c.drawImage(
                        playerImage,
                        data.startX,
                        data.startY,
                        data.endX,
                        data.endY,
                        canvas.width/2,
                        canvas.height/1.5,
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
                        canvas.height/1.5,
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
                    canvas.height/1.5 - newPositionRelative.y,
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

    function goTo(x, y, tileId, finalTile){
        setProgessingToTile({x, y, tileId, finalTile, status: "moving", plyr: boardDataLocal.currentPlayer.socketID})
        
        let newBoard = {...boardDataLocal}
        let newPlayers = [...newBoard.players]
        let activePlayer = boardDataLocal.players.find(plyr => plyr.socketId === boardDataLocal.currentPlayer.socketId)
        let activePlayerIndex = newPlayers.findIndex(plyr=> plyr.socketId === activePlayer.socketId)
        setTimeout(() => {

            if(activePlayer.position.x !== x && activePlayer.position.x > x){

                activePlayer.position.x -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                
                setMovingData({
                    up: false,
                    down: false,
                    left: true,
                    right: false,
                })
                goTo(x,y, tileId, finalTile)
            } else if(activePlayer.position.x !== x && activePlayer.position.x < x){

                activePlayer.position.x += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setMovingData({
                    up: false,
                    down: false,
                    left: false,
                    right: true,
                })
                goTo(x,y, tileId, finalTile)
            } else if(activePlayer.position.y !== y && activePlayer.position.y > y){

                activePlayer.position.y -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setMovingData({
                    up: true,
                    down: false,
                    left: false,
                    right: false,
                })
                goTo(x,y, tileId, finalTile)
            } else if(activePlayer.position.y !== y && activePlayer.position.y < y){

                activePlayer.position.y += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setMovingData({
                    up: false,
                    down: true,
                    left: false,
                    right: false,
                })
                goTo(x,y, tileId, finalTile)
            } else {
                setMovingData({
                    up: false,
                    down: false,
                    left: false,
                    right: false,
                })
                setProgessingToTile({x,
                                    y,
                                    tileId,
                                    finalTile,
                                    status: "finished"})
                return
            }

            newBoard.players = newPlayers
            newBoard.currentPlayer = activePlayer
            setBoardDataLocal(newBoard)
        }, 75)
    }

    function clickDice(){
        goTo(0,0)
    }

  return (
    <div className='boardworld-container'> 
        <div className='board-header'>
            <div className='players-container'>{boardDataLive.players.map(player => {
                return (
                    <PlayerInfo openManage={props.openManage} boardData={boardDataLocal}player={player} thisPlayer={props.thisPlayer} playerTurn={playerTurn}></PlayerInfo>
                )
            })}</div>
        </div>
        
        {playerTurn && !moving && <PopUp confirmChance={props.confirmChance} buyHouse={buyHouse} closeManage={props.closeManage} manageOpen={props.manageOpen} payRent={props.payRent} declineBuy={props.declineBuy} buyProperty={props.buyProperty} notification={props.notification}></PopUp>}
        {playerTurn && !moving && !props.notification && <img src={diceSVG} width={100} onClick={props.rollDice}></img>}

        <canvas ref={canvasRef} style={{border: "10px solid white"}}/>
    </div>
    
  )
}
