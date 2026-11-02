import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { PublishOfferPage } from '../pages/PublishOfferPage';
import './tokens.css';
export const App = () => (_jsx(Router, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/publicar", element: _jsx(PublishOfferPage, {}) }), _jsx(Route, { path: "*", element: _jsx("div", { children: "Inicio / Feed de Comunidad (SCD)" }) })] }) }) }));
export default App;
