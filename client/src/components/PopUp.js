import React, { useState } from 'react'
import './PopUp.scss'

export default function (props) {
    const [currentProperty, setCurrentProperty] = useState(null)

    function clickPropertyManage(property){
        setCurrentProperty(property)
        console.log(property)
    }

    function handleClose(){
        setCurrentProperty(null)
        props.closeManage()
    }

    function buyHouseButton(property){
        console.log('popup')
        props.buyHouse(property)
    }

  return (
    <>
    { (props.notification || props.manageOpen) && <div className='popup-overlay'>
        {!currentProperty && props.notification && props.notification.type === 'buyProperty?' && <div className='popup-container'>
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

        {!currentProperty && props.notification && props.notification.type === "payRent" &&
            <div className='popup-container'>
            <h2>Rent is due!</h2>

            <div className='property-info'>
            <div className={'colour-strip '+props.notification.property.colour}></div>
                <h3>{props.notification.property.name}</h3>
            </div>

            <p>Owned by - {props.notification.property.owner}</p>

            <p className='property-price'>{props.notification.price}$</p>

            <div className='option-buttons'>
                <div className='option-button decline' onClick={props.payRent}>Pay Up!</div>
            </div>
        </div>
        }

        {!currentProperty && props.manageOpen &&
            <div className='popup-container'>
            <h2>Your Properties</h2>

            <div className='popup-player-properties'>
                {props.manageOpen.ownedProperties && props.manageOpen.ownedProperties.map(property => {
                    return <div className='popup-player-property'>
                        <div className={'colour-strip '+property.colour}></div>
                        <p>{property.name} {property.colour ? (property.houses  ? property.houses+"- houses": "- 0 houses") : null}</p>
                        <div className='option-button decline' style={{width: 100, fontSize: 8, textAlign: 'center'}} onClick={() => clickPropertyManage(property)}>Manage</div>
                    </div>
                })}
            </div>

            <div className='option-buttons'>
                <div className='option-button decline bottom' onClick={handleClose}>Close</div>
            </div>
        </div>
        }

        {currentProperty && 
                    <div className='popup-container'>
                    <h2>{currentProperty.name}</h2>

                    <div className='popup-player-properties' style={{alignItems: 'center', justifyContent: 'center'}}>
                        {!currentProperty.houses && <p>No houses yet, buy one!</p>}
                        {currentProperty.houses && currentProperty.houses.map(house => <p>House</p>)}
                        <div className='option-button buy' style={{width: 100, fontSize: 8, textAlign: 'center'}} onClick={()=>buyHouseButton(currentProperty)}>Buy House</div>
                    </div>

                    <div className='option-buttons'>
                    <div className='option-button decline bottom' onClick={handleClose}>Close</div>
                    </div>
                </div>
        }

        {!currentProperty && props.notification && props.notification.type === "chance" &&
            <div className='popup-container' style={{height: 300}}>
            <h2>Chance!</h2>

            <p style={{width: 300, textAlign: 'center', color: 'lightgray'}}>{props.notification.randomChance.name}</p>

            <div className='option-buttons'>
                <div className='option-button decline' onClick={() => props.confirmChance(props.notification.randomChance)}>Okay</div>
            </div>
        </div>
        }
    </div>}
    </>
  )
}
