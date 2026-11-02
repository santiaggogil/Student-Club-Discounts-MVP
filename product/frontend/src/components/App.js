import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { PublishOfferPage } from '../pages/PublishOfferPage';
import { FeedPage } from '../pages/FeedPage';
import { MapPage } from '../pages/MapPage';
import './tokens.css';
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError)
            return _jsxs("div", { style: { padding: '2rem', textAlign: 'center' }, children: [_jsx("h1", { children: "Algo sali\u00F3 mal." }), _jsx("button", { onClick: () => window.location.reload(), children: "Recargar" })] });
        return this.props.children;
    }
}
export const App = () => (_jsx(Router, { children: _jsx(ErrorBoundary, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/publicar", element: _jsx(PublishOfferPage, {}) }), _jsx(Route, { path: "/mapa", element: _jsx(MapPage, {}) }), _jsx(Route, { path: "/", element: _jsx(FeedPage, {}) })] }) }) }) }));
export default App;
