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
            if(rowIndex === 0 || rowIndex === 10){ // if the row is a top row or bottom
                return <TopBottomRow row={row} key={rowIndex}/>
            } else{
                return <Row row={row} key={rowIndex}/>
            }
        })}
    </div>
  );
}

    function Square(props) {
      return (
        <div className='square'>{props.tile.id} {props.tile.name}</div>
      );
    }

    function TopTile(props) {
      return (
        <div className='tile-top'>{props.tile.id} {props.tile.name}</div>
      );
    }

    function Tile(props) {
        return (
          <div className='tile'>{props.tile.id} {props.tile.name}</div>
        );
      }

    function TopBottomRow(props) {
      return (<>

            {props.row.map((tile, tileRowIndex) => {
                if(tile.tileId === null){ // if it is a center piece
                    return <Center key={tileRowIndex}></Center>
                } else if(tileRowIndex === 0 || tileRowIndex === 10){
                    return <Square tile={tile} key={tileRowIndex}/>
                } else{
                    return <TopTile tile={tile} key={tileRowIndex}/>
                }
              })}

        </>);
    }

    function Row(props) {
        return (<>

              {props.row.map((tile, tileRowIndex) => {
                if(tile.tileId === null){ // if it is a center piece
                    return <Center key={tileRowIndex}></Center>
                } else{
                    return <Tile tile={tile} key={tileRowIndex}/>
                }
              })}

          </>);
      }
      
    function Center({}) {
        return(
            <div className='center'>Center</div>
        )
    }