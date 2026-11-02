import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const timestamp = localStorage.getItem('token_timestamp');
    if (token) {
      if (timestamp) {
        const elapsed = Date.now() - parseInt(timestamp, 10);
        if (elapsed > 30 * 60 * 1000) {
          localStorage.removeItem('token');
          localStorage.removeItem('token_timestamp');
          setIsAuthenticated(false);
          return;
        }
      }
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
    const handleStorage = () => checkAuth();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth-change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth-change', handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
    setIsAuthenticated(false);
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
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Comunidad
              </NavLink>
            </li>
            <li>
              <NavLink to="/mapa" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Mapa
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="search-bar">
          <input type="text" placeholder="Buscar ofertas..." className="search-input" />
        </div>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NavLink to="/publicar" className="btn-primary" style={{ textDecoration: 'none' }}>
              + Publicar Oferta
            </NavLink>
            <button onClick={handleLogout} className="btn-secondary-outline" style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NavLink to="/login" className="btn-secondary-outline" style={{ textDecoration: 'none', padding: '0.4rem 1rem' }}>
              Iniciar Sesión
            </NavLink>
            <NavLink to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
              Registrarse
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
};
