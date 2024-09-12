import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import routeConfigs from './RoutesConfig';
import './App.css';

const App = () => (
  <Router>
    <Routes>
      {Object.values(routeConfigs).map(((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      )))}
    </Routes>
  </Router>
);

export default App;
