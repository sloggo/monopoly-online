import React, {useEffect, useRef, useState} from 'react'
import mapPng from '../assets/map.png'
import playerPng from '../assets/TX Player.png'
import boardDatas from './boardData.json'
import './BoardAlt.scss'
let c;

export default function BoardAlt() {
    const canvasRef = useRef(null)
    const [background, setBackground] = useState({
        image: mapPng,
        offset:{
            x:-576,
            y:-420
        },
        tileSize: 32*2 //1.5 zoom
    })
    const [boardData, setBoardData] = useState(boardDatas)
    const [playerSprite, setPlayerSprite] = useState({
        image: playerPng
    })

    const [players, setPlayers]=useState([
        {
            id:0,
            position:{
                x:22,
                y:11
            },
        },
        {
            id:1,
            position:{
                x:24,
                y:10
            },
            active: true
        }
    ])

    function getPositionFrom(active, relative){
        let xDifference = active.position.x - relative.position.x
        let yDifference = active.position.y - relative.position.y
        console.log(xDifference, yDifference)

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

        const activePlayer = players.find(plyr => plyr.active)

        c.drawImage(image, (-(activePlayer.position.x)*background.tileSize)-background.offset.x, (-(activePlayer.position.y)*background.tileSize-background.offset.y))

        players.forEach(plyr=> {
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
                let newPosition = getPositionFrom(players.find(item => item.active), plyr)
                c.drawImage(
                    playerImage,
                    0,
                    0,
                    playerImage.width/4,
                    playerImage.height,
                    canvas.width/2 + newPosition.x,
                    canvas.height/2 + newPosition.y,
                    playerImage.width/4*2,
                    playerImage.height*2,
            )
            }
        })

        window.requestAnimationFrame(render)
    }

    function handleUserKey(e){
        const activePlayer = players.find(plyr => plyr.active)
        if(e.key === 'w'){
            console.log('w')
            let newBackground = {...background}
            newBackground.position.y -= 1
            setBackground(newBackground)
        }

        if(e.key === 's'){
            console.log('s')
            let newBackground = {...background}
            newBackground.position.y += 1
            setBackground(newBackground)
        }

        if(e.key === 'a'){
            console.log('a')
            let newBackground = {...background}
            newBackground.position.x -= 1
            setBackground(newBackground)
        }

        if(e.key === 'd'){
            console.log('d')
            let newBackground = {...background}
            newBackground.position.x += 1
            setBackground(newBackground)
        }
    }

    useEffect(() => {
        c = canvasRef.current.getContext('2d')
        window.addEventListener("keydown", handleUserKey)
        window.requestAnimationFrame(render)
        let tile0 = boardData.find(tile => tile.tileId === 0)
        goTo(tile0.mapPosition.x, tile0.mapPosition.y)
    }, [])

    function goTo(x, y){
        setTimeout(() => {
            let newPlayers = [...players]
            let activePlayer = newPlayers.find(plyr => plyr.active)
            let activePlayerIndex = newPlayers.findIndex(plyr=> plyr.id === activePlayer.id)

            console.log("goto", x, y)

            if(activePlayer.position.x !== x && activePlayer.position.x > x){

                activePlayer.position.x -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setPlayers(newPlayers)
                goTo(x,y)
            } else if(activePlayer.position.x !== x && activePlayer.position.x < x){

                activePlayer.position.x += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setPlayers(newPlayers)
                goTo(x,y)
            } else if(activePlayer.position.y !== y && activePlayer.position.y > y){

                activePlayer.position.y -= .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setPlayers(newPlayers)
                goTo(x,y)
            } else if(activePlayer.position.y !== y && activePlayer.position.y < y){

                activePlayer.position.y += .5
                newPlayers.splice(activePlayerIndex, 1, activePlayer)
                setPlayers(newPlayers)
                goTo(x,y)
            }
        }, 100)
    }

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems:'center', height: '100vh'}}>
        <canvas ref={canvasRef} style={{border: "10px solid white"}}/>
    </div>
  )
}
