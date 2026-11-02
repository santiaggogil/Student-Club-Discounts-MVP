import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { PublishOfferPage } from '../pages/PublishOfferPage';
import { FeedPage } from '../pages/FeedPage';
import './tokens.css';

export const App: React.FC = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/publicar" element={<PublishOfferPage />} />
        <Route path="/" element={<FeedPage />} />
      </Routes>
    </Layout>
  </Router>
);
export default App;