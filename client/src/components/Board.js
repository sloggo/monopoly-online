import React, { useEffect, useState } from 'react'
import "./Board.css"
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
            {(props.tile.orientation === "top" || props.tile.orientation === "bottom") && <div className='tile topbottom'>{props.tile.name}</div>}
            {(props.tile.orientation === "left" || props.tile.orientation === "right") && <div className='tile leftright'>{props.tile.name}</div>}
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