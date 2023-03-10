import React, {useEffect, useRef, useState} from 'react'
import mapPng from '../assets/map.png'
import playerPng from '../assets/TX Player.png'
let c;

export default function BoardAlt() {
    const canvasRef = useRef(null)
    const [background, setBackground] = useState({
        image: mapPng,
        position: {
            x: -890,
            y: -540
        }
    })

    const [movementCounter, setMovementCounter] = useState(0)

    const [playerSprite, setPlayerSprite] = useState({
        image: playerPng
    })

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

        c.drawImage(image, background.position.x, background.position.y)
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

        window.requestAnimationFrame(render)
    }

    function handleUserKey(e){
        if(e.key === 'w'){
            console.log('w')
            let newBackground = {...background}
            newBackground.position.y += 10
            setBackground(newBackground)
        }

        if(e.key === 's'){
            console.log('s')
            let newBackground = {...background}
            newBackground.position.y -= 10
            setBackground(newBackground)
        }

        if(e.key === 'a'){
            console.log('a')
            let newBackground = {...background}
            newBackground.position.x += 10
            setBackground(newBackground)
        }

        if(e.key === 'd'){
            console.log('d')
            let newBackground = {...background}
            newBackground.position.x -= 10
            setBackground(newBackground)
        }
    }

    useEffect(() => {
        c = canvasRef.current.getContext('2d')
        window.addEventListener("keydown", handleUserKey)
        window.requestAnimationFrame(render)

        goTo(0, 0)
    }, [])

    function goTo(x, y){
        setTimeout(() => {
            let newMovementCounter = movementCounter
            setMovementCounter(newMovementCounter+1)
            console.log("goto", x, y)

            if(background.position.x !== x){
                let newBack = {...background}

                newBack.position.x += 10
                setBackground(newBack)
                goTo(x,y)
            } else if(background.position.y !== y){
                let newBack = {...background}

                newBack.position.y += 10
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
