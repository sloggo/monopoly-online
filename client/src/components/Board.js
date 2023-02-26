import React, { useEffect, useState } from 'react'
import "./Board.scss"
import boardDataFile from "./boardData.json"

export default function Board() {
    const [boardData, setBoardData] = useState(boardDataFile)
    const [players, setPlayers] = useState(generatePlayers(4))

    useEffect(() =>{
        console.log(boardData)
    }, [boardData])

    useEffect(() =>{
        updatePlayersBoardData()
    }, [players])

    function generatePlayers(num){
        let players = [];

        for(let i = 0; i < num; i++){
            if( i === 0 ){
                players.push({playerid: i, currentTile: 0, currentPlayer: true})
            } else{
                players.push({playerid: i, currentTile: 0, currentPlayer: false})
            }
        }

        return players
    }

    function updatePlayersBoardData(){
        let oldBrdData = [...boardData]
        players.forEach(player => {
            let indexOfTile = 48 - player.currentTile
            let copyOfTile = {...oldBrdData[indexOfTile]}

            if(!copyOfTile.playersOnTile){
                copyOfTile.playersOnTile = [];
            } else if(copyOfTile.playersOnTile.includes(player.playerid)){  // stop multiple rerenders of same object
                return
            }
            copyOfTile.playersOnTile.push(player.playerid)
            
            oldBrdData.splice(indexOfTile, 1, copyOfTile)
        })

        setBoardData(oldBrdData)
    }

  return (
    <div className='board-container'>
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
  );
}

    function Square(props) {
      return (
        <div className='square'>{props.tile.name}
            <div className='players-holder'>
                {props.tile.playersOnTile && props.tile.playersOnTile.map((plyr) => {
                    return <p className='player-object'>{plyr}</p>
                })}
            </div>
        </div>
      );
    }


    function Tile(props) {
        return (
            <>
            {
                <div className={`tile ${props.tile.orientation}`}>
                    <div className='players-holder'>
                        {props.tile.playersOnTile && props.tile.playersOnTile.map((plyr) => {
                            return <p className='player-object'>{plyr}</p>
                        })}
                    </div>
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