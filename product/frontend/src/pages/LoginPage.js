import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';
const loginSchema = z.object({
    identifier: z.string().min(1, 'El correo o usuario es obligatorio'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
});
export const LoginPage = () => {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const newErrors = {};
            result.error.errors.forEach(err => {
                if (err.path[0])
                    newErrors[err.path[0]] = err.message;
            });
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('token_timestamp', Date.now().toString());
            navigate('/');
        }
        catch (err) {
            if (err.response?.status === 401) {
                setServerError('Credenciales incorrectas');
            }
            else {
                setServerError(err.response?.data?.message || 'Error al iniciar sesión');
            }
        }
        finally {
            setLoading(false);
        }
    };
    if (loading)
        return _jsx(LoadingState, { message: "Iniciando sesi\u00F3n..." });
    return (_jsxs("div", { className: "auth-container", style: { maxWidth: '420px', margin: '2rem auto', background: 'var(--card-bg, #fff)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color, #e0e0e0)' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '1.5rem' }, children: [_jsx("span", { className: "brand-badge", style: { fontSize: '1rem', padding: '4px 8px' }, children: "SCD" }), _jsx("h2", { style: { marginTop: '0.5rem', fontSize: '1.4rem' }, children: "Student Club Discounts" }), _jsx("p", { style: { color: 'var(--text-muted, #6c757d)', fontSize: '0.9rem' }, children: "El hub inteligente de ahorro universitario" })] }), serverError && _jsx(ErrorState, { title: "Acceso denegado", message: serverError, onRetry: () => setServerError('') }), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [_jsx(FormInput, { label: "Correo electr\u00F3nico", name: "identifier", value: formData.identifier, onChange: e => setFormData({ ...formData, identifier: e.target.value }), error: errors.identifier, placeholder: "correo@ejemplo.com" }), _jsx(FormInput, { label: "Contrase\u00F1a", name: "password", type: "password", value: formData.password, onChange: e => setFormData({ ...formData, password: e.target.value }), error: errors.password, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("div", { style: { textAlign: 'right', marginBottom: '1rem' }, children: _jsx(Link, { to: "/forgot-password", style: { fontSize: '0.85rem', color: 'var(--primary-blue, #0056b3)', textDecoration: 'none' }, children: "Olvid\u00E9 mi contrase\u00F1a" }) }), _jsx("button", { type: "submit", className: "btn-primary", style: { width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }, children: "Iniciar Sesi\u00F3n" })] }), _jsxs("div", { style: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }, children: [_jsx("span", { style: { color: 'var(--text-muted)' }, children: "\u00BFNo tienes una cuenta? " }), _jsx(Link, { to: "/register", style: { color: 'var(--primary-blue, #0056b3)', fontWeight: 600, textDecoration: 'none' }, children: "Registrarse" })] })] }));
};
export default LoginPage;
