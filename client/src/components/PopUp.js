import React from 'react'
import './PopUp.scss'

export default function (props) {
  return (
    <>
    { (props.notification || props.manageOpen) && <div className='popup-overlay'>
        {props.notification && props.notification.type === 'buyProperty?' && <div className='popup-container'>
            <h2>Property for sale!</h2>

            <div className='property-info'>
                <div className='property-dot-colour' style={{backgroundColor: props.notification.property.color}}></div>
                <h3>{props.notification.property.name}</h3>
            </div>

            <p className='property-price'>{props.notification.property.price}$</p>

            <div className='option-buttons'>
                <div className='option-button buy' onClick={props.buyProperty}>Buy</div>
                <div className='option-button decline' onClick={props.declineBuy}>Decline</div>
            </div>
        </div>}

        {props.notification && props.notification.type === "payRent" &&
            <div className='popup-container'>
            <h2>Rent is due!</h2>

            <div className='property-info'>
            <div className={'colour-strip '+props.notification.property.colour}></div>
                <h3>{props.notification.property.name}</h3>
            </div>

            <p>Owned by - {props.notification.property.owner}</p>

            <p className='property-price'>{props.notification.property.price}$</p>

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
