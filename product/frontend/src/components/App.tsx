import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import './tokens.css';

const CommunityFeedPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
    <h2>Feed de la Comunidad</h2>
    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
      Bienvenido a Student Club Discounts. Explora hallazgos y promociones de la comunidad.
    </p>
  </div>
);

const MapPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
    <h2>Mapa de Ofertas</h2>
    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
      Explora las ofertas de supermercados en el mapa interactivo de Manizales.
    </p>
  </div>
);

export const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CommunityFeedPlaceholder />} />
          <Route path="/mapa" element={<MapPlaceholder />} />
          <Route path="*" element={<CommunityFeedPlaceholder />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
