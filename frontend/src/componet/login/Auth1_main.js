import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Navbar from './Navbar';
import List from './List';
import Create0 from './Create0';
import Create1 from './Create1';
import Create2 from './Create2';
import Create3 from './Create3';
import View1 from './View1';

export default function Auth1_main() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/list' element={<List />} />
        <Route path='/create0' element={<Create0 />} />
        <Route path='/create1' element={<Create1 />} />
        <Route path='/create2' element={<Create2 />} />
        <Route path='/create3' element={<Create3 />} />
        
        {/* Handle dynamic project ID */}
        <Route path='/view/:id' element={<View1 />} />
        <Route path='*' element={<h1>Wrong URL Address Page</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
