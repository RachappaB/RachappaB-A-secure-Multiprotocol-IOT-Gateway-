import React from 'react'
import Home from './Home';
import Navbar from './Navbar';
import LOGIN from './LOGIN';
import SignUP from './SignUP';
import Services from './Services';
import About from './About';




import { BrowserRouter,Routes, Route } from 'react-router-dom';
// import Auth_client_main from '../auth1/client/autho_main'
// import Admin from './Admin';



// import {DataProvider} from './Global'

import { DataProvider } from './Global';
export default function Autho_main() {
  return (

<BrowserRouter>
<Navbar/>
<Routes>
<Route path='/' element={<Home/>}/>

  <Route path='/item' element={<Home/>}/>
  <Route path='/about' element={<About/>}/>
  <Route path ='/login' element={<LOGIN/>}/>
  <Route path ='/signup' element={<SignUP/>}/>

  <Route path='/Services' element={<Services/>}/>
  {/* <Route path='/forgot' element={<Fargot/>}/> */}
  {/* <Route path='/Admin' element={<Admin/>}/> */}
  <Route path='*' element={<h1>Wrong  URL Addresss Page</h1>}/>





  
  </Routes></BrowserRouter> 
  
  
 )
}
