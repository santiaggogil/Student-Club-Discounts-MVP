import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';
const offerSchema = z.object({
    titulo: z.string().min(3, 'Título requerido'),
    precio: z.string().min(1, 'Precio requerido'),
    ubicacion: z.string().min(3, 'Ubicación requerida'),
    vigencia: z.string().min(1, 'Vigencia requerida'),
    descripcion: z.string().min(10, 'Descripción muy corta'),
    foto: z.instanceof(File).refine(f => ['image/jpeg', 'image/png'].includes(f.type), 'Formato no permitido')
});
export const PublishOfferPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ titulo: '', precio: '', ubicacion: '', vigencia: '', descripcion: '', foto: null });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleFile = (e) => {
        if (e.target.files?.[0])
            setFormData(prev => ({ ...prev, foto: e.target.files[0] }));
    };
    const handleSubmit = async () => {
        const result = offerSchema.safeParse(formData);
        if (!result.success) {
            const newErrors = {};
            result.error.errors.forEach(err => { if (err.path[0])
                newErrors[err.path[0]] = err.message; });
            setErrors(newErrors);
            return;
        }
        setLoading(true);
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => data.append(k, v));
        try {
            await api.post('/ofertas', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/');
        }
        catch (e) {
            setErrors({ server: e.response?.data?.detail || 'Error al publicar' });
        }
        finally {
            setLoading(false);
        }
    };
    if (loading)
        return _jsx(LoadingState, { message: "Publicando..." });
    return (_jsxs("div", { className: "publish-container", style: { maxWidth: '600px', margin: '2rem auto' }, children: [_jsxs("h2", { children: ["Paso ", step, " de 3"] }), errors.server && _jsx(ErrorState, { title: "Error", message: errors.server }), step === 1 && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "foto", children: "Foto" }), _jsx("input", { id: "foto", type: "file", onChange: handleFile }), errors.foto && _jsx("span", { className: "form-error", children: errors.foto })] })), step === 2 && (_jsxs(_Fragment, { children: [_jsx(FormInput, { label: "T\u00EDtulo", name: "titulo", value: formData.titulo, onChange: e => setFormData({ ...formData, titulo: e.target.value }), error: errors.titulo }), _jsx(FormInput, { label: "Precio", name: "precio", value: formData.precio, onChange: e => setFormData({ ...formData, precio: e.target.value }), error: errors.precio }), _jsx(FormInput, { label: "Ubicaci\u00F3n", name: "ubicacion", value: formData.ubicacion, onChange: e => setFormData({ ...formData, ubicacion: e.target.value }), error: errors.ubicacion }), _jsx(FormInput, { label: "Vigencia", name: "vigencia", value: formData.vigencia, onChange: e => setFormData({ ...formData, vigencia: e.target.value }), error: errors.vigencia })] })), step === 3 && (_jsx(FormInput, { label: "Descripci\u00F3n", name: "descripcion", value: formData.descripcion, onChange: e => setFormData({ ...formData, descripcion: e.target.value }), error: errors.descripcion })), _jsxs("div", { style: { marginTop: '1rem' }, children: [step > 1 && _jsx("button", { onClick: () => setStep(step - 1), children: "Atr\u00E1s" }), step < 3 ? _jsx("button", { onClick: () => setStep(step + 1), children: "Siguiente" }) : _jsx("button", { onClick: handleSubmit, children: "Publicar" })] })] }));
};
