import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { PublishOfferPage } from '../pages/PublishOfferPage';
import { FeedPage } from '../pages/FeedPage';
import { MapPage } from '../pages/MapPage';
import { ProfilePage } from '../pages/ProfilePage';
import { FollowList } from '../pages/FollowList';
import './tokens.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div style={{padding: '2rem', textAlign: 'center'}}><h1>Algo salió mal.</h1><button onClick={() => window.location.reload()}>Recargar</button></div>;
    return this.props.children;
  }
}

export const App: React.FC = () => (
  <Router>
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/publicar" element={<PublishOfferPage />} />
          <Route path="/ofertas/:id/editar" element={<PublishOfferPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/:id" element={<ProfilePage />} />
          <Route path="/perfil/:id/:type" element={<FollowList />} />
          <Route path="/*" element={<FeedPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  </Router>
);
export default App;