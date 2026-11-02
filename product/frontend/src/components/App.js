import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import './tokens.css';
const CommunityFeedPlaceholder = () => (_jsxs("div", { style: { textAlign: 'center', padding: '2rem 1rem' }, children: [_jsx("h2", { children: "Feed de la Comunidad" }), _jsx("p", { style: { color: 'var(--text-muted)', marginTop: '0.5rem' }, children: "Bienvenido a Student Club Discounts. Explora hallazgos y promociones de la comunidad." })] }));
const MapPlaceholder = () => (_jsxs("div", { style: { textAlign: 'center', padding: '2rem 1rem' }, children: [_jsx("h2", { children: "Mapa de Ofertas" }), _jsx("p", { style: { color: 'var(--text-muted)', marginTop: '0.5rem' }, children: "Explora las ofertas de supermercados en el mapa interactivo de Manizales." })] }));
export const App = () => {
    return (_jsx(Router, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(CommunityFeedPlaceholder, {}) }), _jsx(Route, { path: "/mapa", element: _jsx(MapPlaceholder, {}) }), _jsx(Route, { path: "*", element: _jsx(CommunityFeedPlaceholder, {}) })] }) }) }));
};
export default App;
