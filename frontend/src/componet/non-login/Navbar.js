// @flow strict


import * as React from 'react';
import { Link } from 'react-router-dom';
import logo from '../imgs/logo.png'

function Navbar() {
    return (<nav className='navbar sticky-top navbar-primary navbar-expand-sm  bg-primary '> 
    <div className='container-fluid ' >
        <img src={logo} alt="brand-logo" width={"60px"}  className=" bg-secondry " />
        <Link className='navbar-brand' to='/'><b>IOT GATEWAY</b></Link>

        <button className='navbar-toggler' type='button' data-bs-toggle="collapse" data-bs-target='#cnavbar'>
            <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse justify-content-end'  id='cnavbar'>
            <ul className='navbar-nav'>
            < li className='nav-item p-2 ' >
                <Link className='nav-link' to='/'><h3>Home</h3></Link>
            </li>
            
            < li className='nav-item p-2 ' >
                <Link className='nav-link' to='/Services'><h3>Services</h3></Link>
            </li>
            <li className='nav-item p-2 '>
                <Link className='nav-link' to='/about'><h3>About</h3></Link>
            </li>

            < li className='nav-item p-2 ' >
                <Link className='nav-link' to='/Login'><h3>Login</h3></Link>
            </li>

            < li className='nav-item p-2 ' >
                <Link className='nav-link' to='/Signup'><h3>signup</h3></Link>
            </li>
          
            
        </ul>

            </div>
       
    </div>
    </nav>
 
    );
};

export default Navbar;