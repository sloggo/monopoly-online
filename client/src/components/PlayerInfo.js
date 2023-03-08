import React from 'react'
import './PlayerInfo.scss'
import { motion, AnimatePresence } from 'framer-motion'

export default function PlayerInfo(props) {
  return (
    <>
        {props.boardData.currentPlayer.socketId === props.player.socketId ? <motion.div initial={{scale:0.95}} animate={{scale:1}} transition={{duration:1, repeat: Infinity, repeatType:"reverse"}} className={props.thisPlayer.socketId === props.player.socketId ? 'player-info-container you' : 'player-info-container'}>
            <div className='player-info-dot'></div>
            <div className='player-info-data'>
                <div className='player-info-text'>
                    <p className='player-info-name'>{props.player.username}</p>
                    <p className='player-info-money'>{props.player.money}$</p>
                </div>

                {props.thisPlayer.socketId === props.player.socketId && <div className='player-info-manage' onClick={props.openManage}>Manage</div>}
            </div>
        </motion.div>
        :
        <div className={props.thisPlayer.socketId === props.player.socketId ? 'player-info-container you' : 'player-info-container'}>
            <div className='player-info-dot'></div>
            <div className='player-info-data'>
                <div className='player-info-text'>
                    <p className='player-info-name'>{props.player.username}</p>
                    <p className='player-info-money'>{props.player.money}$</p>
                </div>

                {props.thisPlayer.socketId === props.player.socketId && <div className='player-info-manage' onClick={props.openManage}>Manage</div>}
            </div>
        </div>
        }
    </>
  )
}
