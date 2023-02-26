import React, { useEffect, useState } from 'react'
import "./Board.scss"
import boardDataFile from "./boardData.json"
import playerInfoBackground from "../assets/Cyan/playerInfoBack.png"

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
                players.push({playerid: i, currentTile: 0, currentPlayer: true, money: 1000})
            } else{
                players.push({playerid: i, currentTile: 0, currentPlayer: false, money: 1000})
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
    <>
        <div className='boardtiles-container'>
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

        <div className='boardplayers-container'>
            {players.map(player => {
                return <PlayerInfo player={player}></PlayerInfo>
            })}
        </div>
    </>
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

    function PlayerInfo(props){
        return(
            <div className='player-info-container' style={{backgroundImage: `url(${playerInfoBackground})`}}>
                <h2 className='player-info-header'>{props.player.playerid}</h2>
                <p className='player-info-money'>{props.player.money}$</p>
            </div>
        )
    }