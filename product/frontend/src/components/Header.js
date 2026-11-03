import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
export const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const navigate = useNavigate();
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                setIsAuthenticated(true);
                try {
                    const res = await api.get('/usuarios/me');
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
                catch (err) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                }
            }
            else {
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
    useEffect(() => {
        const currentQ = searchParams.get('q') || '';
        if (currentQ !== query) {
            setQuery(currentQ);
        }
    }, [searchParams]);
    useEffect(() => {
        const handler = setTimeout(() => {
            const trimmed = query.trim();
            const currentQ = searchParams.get('q') || '';
            if (trimmed !== currentQ) {
                const newParams = new URLSearchParams(searchParams);
                if (trimmed) {
                    newParams.set('q', trimmed);
                }
                else {
                    newParams.delete('q');
                }
                setSearchParams(newParams);
                if (window.location.pathname !== '/') {
                    navigate('/' + (newParams.toString() ? `?${newParams.toString()}` : ''));
                }
            }
        }, 400);
        return () => clearTimeout(handler);
    }, [query]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const trimmed = query.trim();
            const newParams = new URLSearchParams(searchParams);
            if (trimmed) {
                newParams.set('q', trimmed);
            }
            else {
                newParams.delete('q');
            }
            setSearchParams(newParams);
            if (window.location.pathname !== '/') {
                navigate('/' + (newParams.toString() ? `?${newParams.toString()}` : ''));
            }
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_timestamp');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };
    return (_jsx("header", { className: "main-header", children: _jsxs("div", { className: "header-container", children: [_jsxs(NavLink, { to: "/", className: "brand", children: [_jsx("span", { className: "brand-badge", children: "SCD" }), _jsx("span", { children: "Student Club Discounts" })] }), _jsx("nav", { children: _jsxs("ul", { className: "nav-links", children: [_jsx("li", { children: _jsx(NavLink, { to: "/", className: ({ isActive }) => (isActive && !searchParams.get('q') ? 'nav-link active' : 'nav-link'), children: "Comunidad" }) }), _jsx("li", { children: _jsx(NavLink, { to: "/mapa", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "Mapa" }) })] }) }), _jsx("div", { className: "search-bar", children: _jsx("input", { type: "text", placeholder: "Buscar ofertas...", className: "search-input", value: query, onChange: e => setQuery(e.target.value), onKeyDown: handleKeyDown }) }), isAuthenticated ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx(NavLink, { to: "/publicar", className: "btn-primary", style: { textDecoration: 'none' }, children: "+ Publicar Oferta" }), _jsx(NavLink, { to: "/perfil", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), style: { fontWeight: 600 }, children: "Perfil" }), _jsx("button", { onClick: handleLogout, className: "btn-secondary-outline", style: { padding: '0.4rem 1rem', cursor: 'pointer' }, children: "Cerrar Sesión" })] })) : (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx(NavLink, { to: "/login", className: "btn-secondary-outline", style: { textDecoration: 'none', padding: '0.4rem 1rem' }, children: "Iniciar Sesión" }), _jsx(NavLink, { to: "/register", className: "btn-primary", style: { textDecoration: 'none' }, children: "Registrarse" })] }))ṃ] }) }));
};
