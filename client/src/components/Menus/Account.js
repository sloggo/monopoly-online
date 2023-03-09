import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"

export default function Account(props) {
    const [account, setAccount] = useState(props.account)
    const [visible, setVisible] = useState(props.visible)
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    const [usernameInput, setUserNameInput] = useState(null)
    const [passwordInput, setPasswordInput] = useState(null)

    const changeMousePos = (ev) => {
        setMousePosition({x: ev.pageX, y: ev.pageY})
    }

    const handleChange = (e) => {
        if(e.name === 'name'){
            setUserNameInput(e.value)
        } else{
            setPasswordInput(e.value)
        }
    }

    const handleSubmit = (e) => {
        console.log("submit")
    }

    useEffect(()=>{
        setAccount(props.account)
        setVisible(props.visible)
    }, [props])

  return (
    <div className='account-container' onMouseMove={(ev) => changeMousePos(ev)}>
        { account ?
            <div>
                {/*logged in*/}
                logged in
            </div>
        :
            <div>
                {/*no account*/}
                <h1>Log In;</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                        username:
                        <input type="text" name="name" onChange={(e) => handleChange(e)}/>
                    </label>

                    <label>
                        password:
                        <input type="password" name="password" onChange={(e) => handleChange(e)}/>
                    </label>

                    <input type="submit"></input>
                </form>
            </div>
        }
    </div>
  )
}
