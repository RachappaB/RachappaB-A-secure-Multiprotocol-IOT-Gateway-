import React, { useEffect } from "react"
import axios from 'axios'
import {createContext,useState} from 'react'
import UserAPI from "./UserApi"
export const GlobalState = createContext()

export const DataProvider = ({children}) =>{
    const [token,setToken]= useState(false)
    useEffect(() => {
        const firstLogin = localStorage.getItem('firstLogin');
        if (firstLogin) {
            const refreshToken = async () => {
                try {
                  const res = await axios.get('/user/refresh_token', {
                    withCredentials: true, // Ensure cookies are sent
                  });
                  console.log(res);
                  console.log(res.data.accesstoken);
                  setToken(res.data.accesstoken);
                  console.log(token)
              
                  setTimeout(() => {
                    refreshToken();
                  }, 10 * 60 * 1000); // Refresh token every 10 minutes
                } catch (err) {
                  console.error("Error refreshing token:", err.response?.data?.msg || err.message);
                }
              };
              
          refreshToken();
        }
      }, [1]); // Empty dependency array to run on mount only
      
   
   const state = {
    token: [token, setToken],
    userAPI: UserAPI(token)
}
console.log("hi",token)

    return (  
    <GlobalState.Provider value={state}>
        {children}
    </GlobalState.Provider>
    )
}