import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { RegisterPage } from '../pages/RegisterPage';
import './tokens.css';

export const App: React.FC = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<div>Inicio</div>} />
      </Routes>
    </Layout>
  </Router>
);
export default App;