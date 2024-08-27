// @flow strict

import * as React from 'react';
import {useNavigate} from 'react-router-dom'
import { BrowserRouter, Link, Route, Router, Routes } from 'react-router-dom';
import logo from '../imgs/logo.png'
import axios  from 'axios';
import { useState } from 'react';
import Navbar from './Navbar';
// import background from '../autho/bg.jpg';
// import bg from '../img/newbg.jpg';
// import client from 'auth1/client/Home';

function SignUP() {   
    //const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [name,setname] = useState('')
    const [phone,setphone]= useState(0)
    
    const [password,setPassword] = useState('')
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await localStorage.clear();
            const res = await axios.post('http://localhost:3001/customer/register', {
                email,
                password,
                name,
                phone
            });
            
            // Check the response data
            console.log(res.data); // Add this line to see the response in the console
    
            if (res.data.accesstoken) {
                localStorage.setItem('firstLogin', true);
                localStorage.setItem('accessToken', res.data.accesstoken);
                window.location.href = "/";
            } else {
                alert("Registration failed. Please try again.");
            }
        } catch (err) {
            alert(err.response?.data?.msg || "An error occurred during registration.");
        }
    }
    


    return (
        // @flow strict
        // <div style={{ backgroundImage: `url(${background})` }}>
        // <div style={{ backgroundImage: `url(${bg})` }}>
        <div>
        <div className='row-4'>
            <div className=" text-center ">
                <img className='rounded-circle' src={logo} width="250px" />
                <div className="text-center m-5-auto">
            <h2 className= 'text-black'>Customer Register </h2>
            <h4 className= 'text-black'>Create Your  Account</h4>
            <form onSubmit={handleSubmit}>
                <p>
                    <label>First Name </label> <br/>
                    <input type="text" required 
                    name="fname"
                    value={name}
                    onChange={(e)=>setname(e.target.value)}/>
                </p>
                
                <p>
                    <label>Email Address</label><br/>
                    <input type="email"  required 
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}/>
                </p>
                <p>
                    <label>Phone Number</label><br/>
                    <input type="text"  required
                    name="phoneNumber"
                    value={phone}
                    onChange={(e)=>setphone(e.target.value)} />
                </p>
                
             
               
                <p>
                    <label>Password</label><br/>
                    <input type="password"  required name="password"   value={password}
                    onChange={(e)=>setPassword(e.target.value)}/>
                </p>
              
                <p>
                    <input type="checkbox" name="checkbox" id="checkbox" required /> 
                    <span>I agree all statements in <a href="https://google.com" target="_blank" rel="noopener noreferrer">terms of service</a>
                    </span>.
                </p>
                <p>
                    <button id="sub_btn" type="submit">Register</button>
                </p>
                
            </form> 
            <footer>
                <p><Link to="/" className= 'text-black'><b>Back to Homepage</b></Link>.</p>
                <p className= 'text-black'> <b>Already Have an Account?</b> <Link to="/CustomerLogin" className= 'text-black'><b>Log In </b></Link>.</p>
            </footer>
        </div>
        </div>
        </div>
        </div>
        
        


    );
};

export default SignUP;