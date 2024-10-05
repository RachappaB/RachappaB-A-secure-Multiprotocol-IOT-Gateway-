import React from 'react'
import { Link } from 'react-router-dom'
import { GlobalState } from './Global'
import { useContext } from 'react'

export default function Profile() {
    
    const state = useContext(GlobalState)
    const [name,setname] = state.userAPI.name
    const [phone,setphone] = state.userAPI.phone
  const [token] = state.token
  const [email,setemail]= state.userAPI.email
  return (
    
    <div >
    <div className=' d-flex p-2 ' >
        <div className='row' style={{width:"300px"}}>
            <img src='https://avatars.githubusercontent.com/u/97609401?s=48&v=4'/>  
        </div>
        <div className=' row'>
            <div className='bg-primary'>
                <p className=''>
                    Name : {name} 
                    
                </p>
                <p>
                    Email Id : {email}  
                </p>
             
                <p>
                    Contact :{phone}
                </p>
                
            </div>
           
        </div>
        
    </div>
    
    <div >
    </div>

    
    <button className='container-fluid bg-secondary'>
    <Link className='nav-link' to='/logout'><h4>logout</h4></Link>
    </button>
    </div>
    

    )
}
