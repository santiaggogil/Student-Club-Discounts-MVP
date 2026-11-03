import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        try {
          const res = await api.get('/usuarios/me');
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    };
    checkAuth();
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_timestamp');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <NavLink to="/" className="brand">
          <span className="brand-badge">SCD</span>
          <span>Student Club Discounts</span>
        </NavLink>

        <nav>
          <ul className="nav-links">
            <li><NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Comunidad</NavLink></li>
            <li><NavLink to="/mapa" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Mapa</NavLink></li>
          </ul>
        </nav>

        <div className="search-bar">
          <input type="text" placeholder="Buscar ofertas..." className="search-input" />
        </div>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NavLink to="/publicar" className="btn-primary" style={{ textDecoration: 'none' }}>+ Publicar Oferta</NavLink>
            <NavLink to="/perfil" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} style={{ fontWeight: 600 }}>Perfil</NavLink>
            <button onClick={handleLogout} className="btn-secondary-outline" style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>Cerrar Sesión</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NavLink to="/login" className="btn-secondary-outline" style={{ textDecoration: 'none', padding: '0.4rem 1rem' }}>Iniciar Sesión</NavLink>
            <NavLink to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Registrarse</NavLink>
          </div>
        )}
      </div>
    </header>
  );
};
