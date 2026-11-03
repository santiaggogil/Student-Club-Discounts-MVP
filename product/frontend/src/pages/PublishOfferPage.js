import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';
const publishSchema = z.object({
    titulo: z.string().min(3, 'Título requerido'),
    precio: z.string().min(1, 'Precio requerido'),
    ubicacion: z.string().min(3, 'Ubicación requerida'),
    vigencia: z.string().min(1, 'Vigencia requerida').refine(val => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
    }, 'La fecha de vigencia debe ser futura'),
    descripcion: z.string().min(10, 'Descripción muy corta'),
    foto: z.instanceof(File).refine(f => ['image/jpeg', 'image/png'].includes(f.type), 'Formato no permitido')
});
const editSchema = z.object({
    titulo: z.string().min(3, 'Título requerido'),
    precio: z.string().min(1, 'Precio requerido'),
    ubicacion: z.string().min(3, 'Ubicación requerida'),
    vigencia: z.string().min(1, 'Vigencia requerida').refine(val => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
    }, 'La fecha de vigencia debe ser futura'),
    descripcion: z.string().min(10, 'Descripción muy corta'),
    foto: z.instanceof(File).optional().nullable().refine(f => !f || ['image/jpeg', 'image/png'].includes(f.type), 'Formato no permitido')
});
export const PublishOfferPage = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ titulo: '', precio: '', ubicacion: '', vigencia: '', descripcion: '', foto: null });
    const [initialData, setInitialData] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            setFetching(true);
            api.get(`/ofertas/${id}`)
                .then(res => {
                const data = res.data;
                setInitialData(data);
                setFormData({
                    titulo: data.titulo || '',
                    precio: data.precio !== undefined ? String(data.precio) : '',
                    ubicacion: data.ubicacion || '',
                    vigencia: data.vigencia ? new Date(data.vigencia).toISOString().slice(0, 16) : '',
                    descripcion: data.descripcion || '',
                    foto: null
                });
            })
                .catch(err => {
                const detail = err.response?.data?.detail || err.response?.data?.message || 'Error al cargar la oferta';
                setServerError(typeof detail === 'string' ? detail : JSON.stringify(detail));
            })
                .finally(() => setFetching(false));
        }
    }, [id]);
    const handleFile = (e) => {
        if (e.target.files?.[0])
            setFormData(prev => ({ ...prev, foto: e.target.files[0] }));
    };
    const handleSubmit = async () => {
        setServerError('');
        const schema = isEditMode ? editSchema : publishSchema;
        const result = schema.safeParse(formData);
        if (!result.success) {
            const newErrors = {};
            result.error.errors.forEach(err => {
                if (err.path[0])
                    newErrors[err.path[0]] = err.message;
            });
            setErrors(newErrors);
            return;
        }
        setLoading(true);
        if (isEditMode) {
            const data = new FormData();
            if (formData.titulo !== initialData?.titulo)
                data.append('titulo', formData.titulo);
            if (formData.precio !== String(initialData?.precio))
                data.append('precio', formData.precio);
            if (formData.ubicacion !== initialData?.ubicacion)
                data.append('ubicacion', formData.ubicacion);
            if (formData.vigencia && initialData?.vigencia && new Date(formData.vigencia).toISOString() !== new Date(initialData.vigencia).toISOString()) {
                data.append('vigencia', new Date(formData.vigencia).toISOString());
            }
            else if (formData.vigencia && !initialData?.vigencia) {
                data.append('vigencia', new Date(formData.vigencia).toISOString());
            }
            if (formData.descripcion !== initialData?.descripcion)
                data.append('descripcion', formData.descripcion);
            if (formData.foto)
                data.append('foto', formData.foto);
            try {
                await api.put(`/ofertas/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                navigate('/');
            }
            catch (e) {
                const detail = e.response?.data?.detail || e.response?.data?.message || 'Error al actualizar la oferta';
                setServerError(typeof detail === 'string' ? detail : JSON.stringify(detail));
            }
            finally {
                setLoading(false);
            }
        }
        else {
            const data = new FormData();
            data.append('titulo', formData.titulo);
            data.append('precio', formData.precio);
            data.append('ubicacion', formData.ubicacion);
            data.append('vigencia', new Date(formData.vigencia).toISOString());
            data.append('descripcion', formData.descripcion);
            if (formData.foto)
                data.append('foto', formData.foto);
            try {
                await api.post('/ofertas', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                navigate('/');
            }
            catch (e) {
                const detail = e.response?.data?.detail || e.response?.data?.message || 'Error al publicar la oferta';
                setServerError(typeof detail === 'string' ? detail : JSON.stringify(detail));
            }
            finally {
                setLoading(false);
            }
        }
    };
    if (fetching)
        return _jsx(LoadingState, { message: "Cargando oferta..." });
    if (loading)
        return _jsx(LoadingState, { message: isEditMode ? "Guardando oferta..." : "Publicando oferta..." });
    return (_jsxs("div", { className: "publish-container", style: { maxWidth: '600px', margin: '2rem auto', background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color, #e0e0e0)' }, children: [_jsxs("h2", { style: { marginBottom: '1rem' }, children: [isEditMode ? `Editar Oferta - Paso ${step} de 3` : `Publicar Nuevo Hallazgo - Paso ${step} de 3`] }), serverError && _jsx(ErrorState, { title: "Error del servidor", message: serverError, onRetry: () => setServerError('') }), step === 1 && (_jsxs("div", { className: "form-group", children: [_jsxs("label", { htmlFor: "foto", className: "form-label", children: ["Foto de la oferta ", isEditMode && '(opcional)'] }), _jsx("input", { id: "foto", type: "file", onChange: handleFile, className: "form-control", accept: "image/jpeg,image/png" }), errors.foto && _jsx("span", { className: "form-error", role: "alert", children: errors.foto })] })), step === 2 && (_jsxs(_Fragment, { children: [_jsx(FormInput, { label: "T\u00EDtulo", name: "titulo", value: formData.titulo, onChange: e => setFormData({ ...formData, titulo: e.target.value }), error: errors.titulo, placeholder: "Ej. Empanada Mixta x1" }), _jsx(FormInput, { label: "Precio", name: "precio", type: "number", value: formData.precio, onChange: e => setFormData({ ...formData, precio: e.target.value }), error: errors.precio, placeholder: "Ej. 3000" }), _jsx(FormInput, { label: "Ubicaci\u00F3n", name: "ubicacion", value: formData.ubicacion, onChange: e => setFormData({ ...formData, ubicacion: e.target.value }), error: errors.ubicacion, placeholder: "Ej. Centro, Universidades" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "vigencia", className: "form-label", children: "Vigencia" }), _jsx("input", { id: "vigencia", type: "datetime-local", value: formData.vigencia, onChange: e => setFormData({ ...formData, vigencia: e.target.value }), className: `form-control ${errors.vigencia ? 'is-invalid' : ''}` }), errors.vigencia && _jsx("span", { className: "form-error", role: "alert", children: errors.vigencia })] })] })), step === 3 && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "descripcion", className: "form-label", children: "Descripci\u00F3n de la oferta" }), _jsx("textarea", { id: "descripcion", value: formData.descripcion, onChange: e => setFormData({ ...formData, descripcion: e.target.value }), className: "form-control", rows: 4, placeholder: "Una de las mejores empanadas..." }), errors.descripcion && _jsx("span", { className: "form-error", role: "alert", children: errors.descripcion })] })), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }, children: [step > 1 ? _jsx("button", { onClick: () => setStep(step - 1), className: "btn-secondary-outline", children: "Atr\u00E1s" }) : _jsx("div", {}), step < 3 ? _jsx("button", { onClick: () => setStep(step + 1), className: "btn-primary", children: "Siguiente" }) : _jsx("button", { onClick: handleSubmit, className: "btn-primary", children: isEditMode ? 'Guardar Cambios' : 'Publicar Oferta' })] })] }));
};
export default PublishOfferPage;
