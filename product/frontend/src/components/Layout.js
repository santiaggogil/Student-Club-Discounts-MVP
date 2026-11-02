import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Header } from './Header';
export const Layout = ({ children }) => {
    return (_jsxs("div", { className: "app-layout", children: [_jsx(Header, {}), _jsx("main", { className: "main-content", children: children })] }));
};
