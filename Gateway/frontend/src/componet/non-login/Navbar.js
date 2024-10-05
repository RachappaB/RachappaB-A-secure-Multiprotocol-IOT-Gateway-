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
                <Link className='nav-link navbar-dark' to='/'><h3 className='text-body'>Home</h3></Link>
            </li>
            
            < li className='nav-item p-2 ' >
                <Link className='nav-link navbar-dark ' to='/Services'><h3 className='text-body'>Services</h3></Link>
            </li>
            <li className='nav-item p-2 '>
                <Link className='nav-link' to='/about'><h3 className='text-body'>About</h3></Link>
            </li>

            < li className='nav-item p-2 ' >
                <Link className='nav-link navbar-dark' to='/Login'><h3 className='text-body'>Login</h3></Link>
            </li>

            < li className='nav-item p-2 ' >
                <Link className='nav-link navbar-dark' to='/Signup'><h3 className='text-body'>signup</h3></Link>
            </li>
          
            
        </ul>

            </div>
       
    </div>
    </nav>
 
    );
};

export default Navbar;