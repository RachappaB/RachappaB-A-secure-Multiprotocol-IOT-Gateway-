// @flow strict


import * as React from 'react';
import { Link } from 'react-router-dom';
import logo from '../imgs/logo.png'

function Navbar() {
    return (<nav className='navbar sticky-top navbar-primary navbar-expand-sm bg-warning '> 
    <div className='container-fluid ' >
        <img src={logo} alt="brand-logo" width={"60px"}  className=" bg-secondry " />
        <Link className='navbar-brand' to='/'><b>IOT GATEWAY</b></Link>

        <button className='navbar-toggler' type='button' data-bs-toggle="collapse" data-bs-target='#cnavbar'>
            <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse justify-content-end'  id='cnavbar'>
            <ul className='navbar-nav'>
            < li className='nav-item p-2 ' >
                <Link className='nav-link' to='/'><b>Home</b></Link>
            </li>
            
            < li className='nav-item p-2 ' >
                <Link className='nav-link' to='/Create0'><b>create</b></Link>
            </li>
            <li className='nav-item p-2'>
                <Link className='nav-link' to='/list'><b>list</b></Link>
            </li>
            
            <li className='nav-item p-2'>
                <Link className='nav-link' to='/profile'><b>User</b></Link>
            </li>
            
            
        </ul>

            </div>
       
    </div>
    </nav>
 
    );
};

export default Navbar;