import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
export const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const navigate = useNavigate();
    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(!!localStorage.getItem('token'));
        };
        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('token_timestamp');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };
    return (_jsx("header", { className: "main-header", children: _jsxs("div", { className: "header-container", children: [_jsxs(NavLink, { to: "/", className: "brand", children: [_jsx("span", { className: "brand-badge", children: "SCD" }), _jsx("span", { children: "Student Club Discounts" })] }), _jsx("nav", { children: _jsxs("ul", { className: "nav-links", children: [_jsx("li", { children: _jsx(NavLink, { to: "/", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "Comunidad" }) }), _jsx("li", { children: _jsx(NavLink, { to: "/mapa", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "Mapa" }) })] }) }), _jsx("div", { className: "search-bar", children: _jsx("input", { type: "text", placeholder: "Buscar ofertas...", className: "search-input" }) }), isAuthenticated ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx(NavLink, { to: "/publicar", className: "btn-primary", style: { textDecoration: 'none' }, children: "+ Publicar Oferta" }), _jsx("button", { onClick: handleLogout, className: "btn-secondary-outline", style: { padding: '0.4rem 1rem', cursor: 'pointer' }, children: "Cerrar Sesi\u00F3n" })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx(NavLink, { to: "/login", className: "btn-secondary-outline", style: { textDecoration: 'none', padding: '0.4rem 1rem' }, children: "Iniciar Sesi\u00F3n" }), _jsx(NavLink, { to: "/register", className: "btn-primary", style: { textDecoration: 'none' }, children: "Registrarse" })] }))] }) }));
};
