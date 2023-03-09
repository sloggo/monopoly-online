import React from 'react'
import './PopUp.scss'

export default function (props) {
  return (
    <>
    { (props.rentPay || props.propertyBuy || props.manageOpen) && <div className='popup-overlay'>
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
            <div className={'colour-strip '+props.rentPay.property.colour}></div>
                <h3>{props.rentPay.property.name}</h3>
            </div>

            <p>Owned by - {props.rentPay.property.owner}</p>

            <p className='property-price'>{props.rentPay.price}$</p>

            <div className='option-buttons'>
                <div className='option-button decline' onClick={props.payRent}>Pay Up!</div>
            </div>
        </div>
        }

        {props.manageOpen &&
            <div className='popup-container'>
            <h2>Your Properties</h2>

            <div className='popup-player-properties'>
                {props.manageOpen.ownedProperties && props.manageOpen.ownedProperties.map(property => {
                    return <div className='popup-player-property'>
                        <div className={'colour-strip '+property.colour}></div>
                        <p>{property.name} {property.colour ? (property.houses  ? property.houses+"- houses": "- 0 houses") : null}</p>
                    </div>
                })}
            </div>

            <div className='option-buttons'>
                <div className='option-button decline bottom' onClick={props.closeManage}>Close</div>
            </div>
        </div>
        }
    </div>}
    </>
  )
}
