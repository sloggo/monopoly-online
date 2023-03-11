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
        position: {
            x: 26,
            y: 15
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
                x:1,
                y:1
            },
            active: true
        },
        {
            id:1,
            position:{
                x:24,
                y:10
            }
        }
    ])

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

        c.drawImage(image, (-(background.position.x)*background.tileSize)-background.offset.x, (-(background.position.y)*background.tileSize-background.offset.y))

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
                c.drawImage(
                    playerImage,
                    0,
                    0,
                    playerImage.width/4,
                    playerImage.height,
                    canvas.width/4,
                    canvas.height/4,
                    playerImage.width/4*2,
                    playerImage.height*2,
            )
            }
        })

        window.requestAnimationFrame(render)
    }

    function handleUserKey(e){
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
            console.log("goto", x, y)

            if(background.position.x !== x && background.position.x > x){
                let newBack = {...background}

                newBack.position.x -= .5
                setBackground(newBack)
                goTo(x,y)
            } else if(background.position.x !== x && background.position.x < x){
                let newBack = {...background}

                newBack.position.x += .5
                setBackground(newBack)
                goTo(x,y)
            } else if(background.position.y !== y && background.position.y > y){
                let newBack = {...background}

                newBack.position.y -= .5
                setBackground(newBack)
                goTo(x,y)
            } else if(background.position.y !== y && background.position.y < y){
                let newBack = {...background}

                newBack.position.y += .5
                setBackground(newBack)
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
