import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './FormInput.css';
export const FormInput = ({ label, error, helperText, id, name, className = '', ...props }) => {
    const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');
    return (_jsxs("div", { className: `form-group ${className}`, children: [_jsx("label", { htmlFor: inputId, className: "form-label", children: label }), _jsx("input", { id: inputId, name: name, "aria-invalid": !!error, "aria-describedby": error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined, className: `form-control ${error ? 'is-invalid' : ''}`, ...props }), error && (_jsx("span", { id: `${inputId}-error"`, className: "form-error", role: "alert", children: error })), helperText && !error && (_jsx("span", { id: `${inputId}-helper"`, className: "form-helper", children: helperText }))] }));
};
