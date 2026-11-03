import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
const profileUpdateSchema = z.object({
    nombre: z.string().max(100, 'Máximo 100 caracteres').optional(),
    biografia: z.string().max(500, 'Máximo 500 caracteres').optional(),
    seguidores_privados: z.boolean().optional(),
});
export const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isPublic = !!id;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    // Estado del formulario de edición (solo para perfil propio)
    const [formData, setFormData] = useState({
        nombre: '',
        biografia: '',
        seguidores_privados: false,
        foto: null,
    });
    const [errors, setErrors] = useState({});
    const [updating, setUpdating] = useState(false);
    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const endpoint = isPublic ? `/usuarios/${id}` : '/usuarios/me';
            const res = await api.get(endpoint);
            setProfile(res.data);
            if (!isPublic) {
                setFormData({
                    nombre: res.data.nombre || '',
                    biografia: res.data.biografia || '',
                    seguidores_privados: !!res.data.seguidores_privados,
                    foto: null,
                });
            }
        }
        catch (err) {
            if (err.response?.status === 401 && !isPublic) {
                navigate('/login');
            }
            else {
                setError(err.response?.data?.detail || 'Error al cargar el perfil');
            }
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, [id]);
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setFormData(prev => ({ ...prev, foto: e.target.files[0] }));
        }
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        const result = profileUpdateSchema.safeParse({
            nombre: formData.nombre,
            biografia: formData.biografia,
            seguidores_privados: formData.seguidores_privados,
        });
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
        setUpdating(true);
        const data = new FormData();
        if (formData.nombre !== undefined)
            data.append('nombre', formData.nombre);
        if (formData.biografia !== undefined)
            data.append('biografia', formData.biografia);
        data.append('seguidores_privados', String(formData.seguidores_privados));
        if (formData.foto)
            data.append('foto', formData.foto);
        try {
            const res = await api.put('/usuarios/me', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile(res.data);
            setSuccessMsg('Perfil actualizado exitosamente');
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar el perfil');
        }
        finally {
            setUpdating(false);
        }
    };
    if (loading)
        return _jsx(LoadingState, { message: "Cargando perfil..." });
    if (error && !profile)
        return _jsx(ErrorState, { title: "Error", message: error, onRetry: fetchProfile });
    if (!profile)
        return _jsx(EmptyState, { title: "Usuario no encontrado", message: "El perfil solicitado no existe." });
    return (_jsxs("div", { className: "profile-container", style: { maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }, children: [_jsxs("div", { style: { background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color, #e0e0e0)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }, children: [_jsx("div", { style: { width: '90px', height: '90px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }, children: profile.foto || profile.foto_url ? (_jsx("img", { src: profile.foto || profile.foto_url, alt: profile.username, style: { width: '100%', height: '100%', objectFit: 'cover' } })) : ((profile.username || 'U').charAt(0).toUpperCase()) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h2", { style: { fontSize: '1.5rem', marginBottom: '0.2rem', color: 'var(--text-color)' }, children: profile.nombre || profile.username }), _jsxs("p", { style: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }, children: ["@", profile.username] }), _jsx("p", { style: { fontSize: '0.95rem', color: 'var(--text-color)', marginBottom: '0.75rem' }, children: profile.biografia || 'Sin biografía' }), _jsxs("div", { style: { display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }, children: [_jsxs("span", { children: ["Seguidores: ", profile.seguidores_count ?? profile.seguidores?.length ?? 0] }), _jsxs("span", { children: ["Seguidos: ", profile.seguidos_count ?? profile.seguidos?.length ?? 0] })] })] })] }), error && _jsx("div", { style: { color: '#dc3545', background: '#f8d7da', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }, role: "alert", children: error }), successMsg && _jsx("div", { style: { color: '#155724', background: '#d4edda', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }, children: successMsg }), !isPublic && (_jsxs("div", { style: { background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color, #e0e0e0)', marginBottom: '2rem' }, children: [_jsx("h3", { style: { marginBottom: '1.25rem', fontSize: '1.2rem' }, children: "Editar Mi Perfil" }), _jsxs("form", { onSubmit: handleUpdate, noValidate: true, children: [_jsx(FormInput, { label: "Nombre o Apodo", name: "nombre", value: formData.nombre, onChange: e => setFormData({ ...formData, nombre: e.target.value }), error: errors.nombre, placeholder: "Tu nombre real o apodo" }), _jsxs("div", { className: "form-group", style: { marginBottom: '1rem' }, children: [_jsx("label", { htmlFor: "biografia", className: "form-label", children: "Biograf\u00EDa (texto plano)" }), _jsx("textarea", { id: "biografia", value: formData.biografia, onChange: e => setFormData({ ...formData, biografia: e.target.value }), className: "form-control", rows: 3, placeholder: "Cu\u00E9ntanos sobre ti..." }), errors.biografia && _jsx("span", { className: "form-error", role: "alert", children: errors.biografia })] }), _jsxs("div", { className: "form-group", style: { marginBottom: '1rem' }, children: [_jsx("label", { htmlFor: "foto", className: "form-label", children: "Foto de perfil" }), _jsx("input", { id: "foto", type: "file", accept: "image/jpeg,image/png", onChange: handleFileChange, className: "form-control" })] }), _jsxs("div", { className: "form-group", style: { flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }, children: [_jsx("input", { type: "checkbox", id: "seguidores_privados", checked: formData.seguidores_privados, onChange: e => setFormData({ ...formData, seguidores_privados: e.target.checked }), style: { width: '18px', height: '18px', cursor: 'pointer' } }), _jsx("label", { htmlFor: "seguidores_privados", className: "form-label", style: { cursor: 'pointer', marginBottom: 0 }, children: "Hacer mi lista de seguidores privada" })] }), _jsx("button", { type: "submit", className: "btn-primary", disabled: updating, children: updating ? 'Guardando...' : 'Guardar Cambios' })] })] })), _jsxs("div", { style: { marginTop: '2rem' }, children: [_jsx("h3", { style: { marginBottom: '1rem', fontSize: '1.2rem' }, children: isPublic ? `Ofertas publicadas por @${profile.username}` : 'Mis Ofertas Publicadas' }), (!profile.ofertas || profile.ofertas.length === 0) ? (_jsx(EmptyState, { title: "Sin ofertas", message: "Este usuario a\u00FAn no ha publicado ofertas comunitarias." })) : (profile.ofertas.map((offer) => (_jsx(OfferCard, { offer: { ...offer, autor_username: profile.username } }, offer.id))))] })] }));
};
export default ProfilePage;
