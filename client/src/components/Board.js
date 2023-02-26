import React, { useEffect, useState } from 'react'
import "./Board.scss"
import boardDataFile from "./boardData.json"

export default function Board() {
    const [boardData] = useState(boardDataFile)

    useEffect(() =>{
        console.log(boardData)
    }, [])

  return (
    <div className='board-container'>

        {boardData.map((row, rowIndex) => { // for each row of game board
            return <Row row={row} key={rowIndex}/>
        })}

    </div>
  );
}

    function Square(props) {
      return (
        <div className='square'>{props.tile.id} {props.tile.name}</div>
      );
    }


    function Tile(props) {
        return (
            <>
            {
                <div className={`tile ${props.tile.orientation}`}>
                    <div className={`colour-bar ${props.tile.colour}`}></div>
                    <div className='name-info'>
                        <p>{props.tile.name}</p>
                        {props.tile.price ? <p>{props.tile.price}</p> : null}
                    </div>
                </div>
            }
            </>
          );
      }

    function Row(props) {
        return (<>

              {props.row.map((tile, tileRowIndex) => {
                if(tile.tileId === null){ // if it is a center piece
                    return <Center key={tileRowIndex}></Center>
                } else if(tile.type === "tile"){
                    return <Tile tile={tile} key={tileRowIndex}/>
                } else if(tile.type === "square"){
                    return <Square tile={tile} key={tileRowIndex}/>
                }
              })}

          </>);
      }
      
    function Center({}) {
        return(
            <div className='center'></div>
        )
    }