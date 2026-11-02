import React from 'react';
import { NavLink } from 'react-router-dom';

export const Header: React.FC = () => {
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

        <button className="btn-primary" aria-label="Publicar oferta">
          + Publicar Oferta
        </button>
      </div>
    </header>
  );
};
