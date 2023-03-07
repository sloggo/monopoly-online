import React from 'react'
import './PopUp.scss'

export default function (props) {
  return (
    <>
    { (props.rentPay || props.propertyBuy) && <div className='popup-overlay'>
        {props.propertyBuy && <div className='popup-container'>
            <h2>Property for sale!</h2>

            <div className='property-info'>
                <div className='property-dot-colour' style={{backgroundColor: props.buyProperty.color}}></div>
                <h3>{props.propertyBuy.name}</h3>
            </div>

            <p className='property-price'>{props.propertyBuy.price}$</p>

            <div className='option-buttons'>
                <div className='option-button buy' onClick={props.buyProperty}>Buy</div>
                <div className='option-button decline' onClick={props.declineBuy}>Decline</div>
            </div>
        </div>}

        {props.rentPay &&
            <div className='popup-container'>
            <h2>Rent is due!</h2>

            <div className='property-info'>
                <div className='property-dot-colour' style={{backgroundColor: props.buyProperty.color}}></div>
                <h3>{props.rentPay.name}</h3>
            </div>

            <p>Owned by - {props.rentPay.owner}</p>

            <p className='property-price'>{props.rentPay.price * 0.1}$</p>

            <div className='option-buttons'>
                <div className='option-button decline' onClick={props.payRent}>Pay Up!</div>
            </div>
        </div>
        }
    </div>}
    </>
  )
}
