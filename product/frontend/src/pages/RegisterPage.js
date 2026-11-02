import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';
const registerSchema = z.object({
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    username: z.string().min(3, 'Mínimo 3 caracteres').optional().or(z.literal('')),
    password: z.string().min(10, 'Mínimo 10 caracteres').regex(/[A-Z]/, 'Falta mayúscula').regex(/[a-z]/, 'Falta minúscula').regex(/[0-9]/, 'Falta número'),
});
export const RegisterPage = () => {
    const [formData, setFormData] = useState({ email: '', username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = registerSchema.safeParse(formData);
        if (!result.success) {
            const newErrors = {};
            result.error.errors.forEach(err => { if (err.path[0])
                newErrors[err.path[0]] = err.message; });
            setErrors(newErrors);
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        }
        catch (err) {
            setServerError(err.response?.data?.message || 'Error al registrar');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading)
        return _jsx(LoadingState, { message: "Creando cuenta..." });
    return (_jsxs("div", { className: "auth-container", children: [_jsx("h2", { children: "Crear cuenta" }), serverError && _jsx(ErrorState, { title: "Error", message: serverError, onRetry: () => setServerError('') }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(FormInput, { label: "Correo", name: "email", value: formData.email, onChange: e => setFormData({ ...formData, email: e.target.value }), error: errors.email }), _jsx(FormInput, { label: "Usuario", name: "username", value: formData.username, onChange: e => setFormData({ ...formData, username: e.target.value }), error: errors.username }), _jsx(FormInput, { label: "Contrase\u00F1a", name: "password", type: "password", value: formData.password, onChange: e => setFormData({ ...formData, password: e.target.value }), error: errors.password }), _jsx("button", { type: "submit", className: "btn-primary", children: "Crear cuenta" })] }), _jsx(Link, { to: "/login", children: "\u00BFYa tienes cuenta? Iniciar Sesi\u00F3n" })] }));
};
