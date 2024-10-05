import React from 'react';
import ReactDOM from 'react-dom/client';

import Autho_main from './componet/non-login/AUTOMAIN';

import Auth1_main from './componet/login/Auth1_main';
import './index.css';

import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));


 const firstLogin = localStorage.getItem('firstLogin');

if(!firstLogin )
{
   root.render(
  
      <Autho_main/>
      // <Auth1_main/>

   );
}
else
{
      
   root.render(
    <Auth1_main/>

     
   );

   
   

}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
