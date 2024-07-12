import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/home.jsx';
import SignIn from './pages/signin.jsx';
const App = () => {
  return (
  <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/signin' element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  </>    
  );
};

export default App;
