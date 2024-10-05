import logo from './logo.svg';
import './App.css';
import Navbar from './componet/non-login/Navbar';
import Home from './componet/non-login/Home';
import Services from './componet/non-login/Services';
import About from './componet/non-login/About';
import LOGIN from './componet/non-login/LOGIN';
import SignUP from './componet/non-login/SignUP';




import { BrowserRouter, Link, Route, Router, Routes } from 'react-router-dom';




function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <ul>
      <li>
        <Link to ={'/'}>Home</Link>
      </li>
    </ul>
    </BrowserRouter>
    
    </>
    
  );
}

export default App;
