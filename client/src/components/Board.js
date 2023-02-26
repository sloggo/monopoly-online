import React from 'react'
import "./Board.css"

export default function Board() {
  return (
    <div className='board-container'>
        <TopBottomRow     />
        <Row     />
        <Row     />
        <Row     />
        <Row     />
        <Row     />
        <Row     />
        <Row     />
        <Row     />
        <Row     />
        <TopBottomRow     />
    </div>
  );
}

    function Square({}) {
      return (
        <div className='square'>Square</div>
      );
    }

    function TopTile({}) {
      return (
        <div className='tile-top'>TopTile</div>
      );
    }

    function Tile({}) {
        return (
          <div className='tile'>Tile</div>
        );
      }

    function TopBottomRow({}) {
      return (<>
            <Square />

            <TopTile />
            <TopTile />
            <TopTile />
            <TopTile />
            <TopTile />
            <TopTile />
            <TopTile />
            <TopTile />
            <TopTile />

            <Square />
        </>);
    }

    function Row({}) {
        return (<>
              <Tile />
              
              <Center/>
              <Center/>
              <Center/>
              <Center/>
              <Center/>
              <Center/>
              <Center/>
              <Center/>
              <Center/>
            
              <Tile />
          </>);
      }
      
    function Center({}) {
        return(
            <div className='center'>Center</div>
        )
    }