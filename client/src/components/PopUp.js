import React from 'react'
import './PopUp.scss'

export default function (props) {
  return (
    <div className='popup-overlay'>
        <div className='popup-container'>
            <h2>Property for sale!</h2>

            <div className='property-info'>
                <div className='property-dot-colour' style={{backgroundColor: props.buyProperty.color}}></div>
                <h3>{props.propertyBuy.name}</h3>
            </div>

            <p className='property-price'>{props.buyProperty.price}$</p>

            <div className='option-buttons'>
                <div className='option-button buy' onClick={props.buyProperty}>Buy</div>
                <div className='option-button decline'>Decline</div>
            </div>
        </div>
    </div>
  )
}
