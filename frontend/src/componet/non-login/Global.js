import React, { useEffect } from "react"
import axios from 'axios'
import {createContext,useState} from 'react'
import UserAPI from './USerApi';

export const GlobalState = createContext()

export const DataProvider = ({children}) =>{
    const [token,setToken]= useState(true)
   
   const state = {
    token: [token, setToken],
    userAPI: UserAPI(token)
}
    return (  
    <GlobalState.Provider value={state}>
        {children}
    </GlobalState.Provider>
    )
}