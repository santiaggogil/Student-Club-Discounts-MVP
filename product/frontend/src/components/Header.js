import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Header = () => {
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

  return (_jsx("header", { className: "main-header", children: _jsxs("div", { className: "header-container", children: [_jsxs(NavLink, { to: "/", className: "brand", children: [_jsx("span", { className: "brand-badge", children: "SCD" }), _jsx("span", { children: "Student Club Discounts" })] }), _jsx("nav", { children: _jsxs("ul", { className: "nav-links", children: [_jsx("li", { children: _jsx(NavLink, { to: "/", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "Comunidad" }) }), _jsx("li", { children: _jsx(NavLink, { to: "/mapa", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "Mapa" }) })] }) }), _jsx("div", { className: "search-bar", children: _jsx("input", { type: "text", placeholder: "Buscar ofertas...", className: "search-input" }) }), isAuthenticated ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx(NavLink, { to: "/publicar", className: "btn-primary", style: { textDecoration: 'none' }, children: "+ Publicar Oferta" }), _jsx("button", { onClick: handleLogout, className: "btn-secondary-outline", style: { padding: '0.4rem 1rem', cursor: 'pointer' }, children: "Cerrar Sesión" })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx(NavLink, { to: "/login", className: "btn-secondary-outline", style: { textDecoration: 'none', padding: '0.4rem 1rem' }, children: "Iniciar Sesión" }), _jsx(NavLink, { to: "/register", className: "btn-primary", style: { textDecoration: 'none' }, children: "Registrarse" })] }))] }) }));
};
