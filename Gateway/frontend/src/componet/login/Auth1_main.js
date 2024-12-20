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
import Profile from './Profile';
import {DataProvider} from './Global'
import Cloud0 from './Cloud0';
import Logout from './Logout';
import Anlysis from './Anlysis';
import AI1 from './AI1';
import Table1 from './Table1';
import Addblemac from './Addblemac';
import Addwifiip from './Addwifiip';
import Push_to_Cloud from './Push_to_Cloud'
import XMLFILE from './XMLFILE';
import Add_python_code from './Add_python_code';
import FileUpload from './Add_python_code';
export default function Auth1_main() {
  return (
    <DataProvider>

    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/list' element={<List />} />
        <Route path='/logout' element={<Logout />} />

        <Route path='/create0' element={<Create0 />} />
        <Route path='/create1' element={<Create1 />} />
        <Route path='/create2' element={<Create2 />} />
        <Route path='/create3' element={<Create3 />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/cloud0' element={<Cloud0 />} />
        <Route path='/ai' element={<AI1 />} />
        <Route path='/anlysis/:projectId' element={<Anlysis />} />
        

        <Route path='/download/:projectId' element={<XMLFILE />} />


           
        <Route path='/push_to_Cloud/:projectId' element={ <Push_to_Cloud/> } />
        <Route path='/addpythoncode/:projectId' element={ <FileUpload/> } />

        {/* Handle dynamic project ID */}
        <Route path='/view/:id' element={<View1 />} />
        <Route path='/Addblemac/:id' element={<Addblemac />} />
        <Route path='/Addwifiip/:id' element={<Addwifiip />} />

        <Route path='/table/:projectId' element={<Table1 />} />

        <Route path='*' element={<h1>Wrong URL Address Page</h1>} />
      </Routes>
    </BrowserRouter>
    </DataProvider>
  );
}
