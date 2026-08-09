import React, { useEffect, useState } from 'react'
import UserLayout from '@/layout/Userlayout'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import styles from './style.module.css'
import { loginUser, registerUser } from '@/config/redux/action/authAction'

function LoginComponent() {
  const authState = useSelector((state) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  const [userLoginMethod, setUserLoginMethod] = useState(false)
  const [email, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")

  
  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard")
    }
  }, [authState.loggedIn, router])

 
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.push("/dashboard")
    }
  }, [router])

  const handleRegister = () => {
    console.log("registering...")
    dispatch(registerUser({ username, password, email, name }))
  }

  const handlelogin = () => {
    console.log("login..")
    dispatch(loginUser({ email, password }))
  }

  
  const toggleAuthMethod = () => {
    dispatch({ type: "auth/emptyMessage" })
    setUserLoginMethod((prev) => !prev)
  }

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer__left}>
            <p className={styles.cardleft__heading}>a
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>
            
            {/* Display status or error message safely */}
            <p style={{ color: authState.isError ? "red" : "green" }}>
              {typeof authState.message === 'object' 
                ? authState.message?.message 
                : authState.message}
            </p>

            <div className={styles.inputContainers}>
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <input 
                    onChange={(e) => setUsername(e.target.value)} 
                    className={styles.inputField} 
                    type="text" 
                    placeholder="Username" 
                  />
                  <input 
                    onChange={(e) => setName(e.target.value)} 
                    className={styles.inputField} 
                    type="text" 
                    placeholder="Name" 
                  />
                </div>
              )}

              <input 
                onChange={(e) => setEmailAddress(e.target.value)} 
                className={styles.inputField} 
                type="text" 
                placeholder="Email" 
              />
              
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                className={styles.inputField} 
                type="password" 
                placeholder="Password" 
              />

              <div 
                onClick={() => {
                  if (userLoginMethod) {
                    handlelogin()
                  } else {
                    handleRegister()
                  }
                }}
                className={styles.buttonWithOutline}
              >
                <p>{userLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>
            </div>
          </div>

          <div className={styles.cardContainer__right}>
            {userLoginMethod ? (
              <p>Don't Have an Account?</p>
            ) : (
              <p className={styles.loginhead}>Already Have an Account?</p>
            )}
            
            <div 
              onClick={toggleAuthMethod}
              style={{ color: "black", textAlign: "center" }} 
              className={styles.buttonWithOutline}
            >
              <p>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default LoginComponent