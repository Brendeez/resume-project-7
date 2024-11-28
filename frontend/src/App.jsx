import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

import AdvancedSearch from './pages/AdvancedSearch';
import AutoSearch from './pages/AutoSearch';


const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/advancedSearch' element={< AdvancedSearch/>} />
      <Route path='/autoSearch' element={< AutoSearch/>} />
      <Route path='*' element={<Home />} />
    </Routes>
  );
};

export default App;
