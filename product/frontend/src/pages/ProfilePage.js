import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
import { FollowModal } from '../components/FollowModal';
const profileUpdateSchema = z.object({
    nombre: z.string().max(100, 'Máximo 100 caracteres').optional(),
    biografia: z.string().max(500, 'Máximo 500 caracteres').optional(),
    seguidores_privados: z.boolean().optional(),
});
export const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isPublic = !!id;
    const [isAuthenticated] = useState(!!localStorage.getItem('token'));
    const [myId, setMyId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [modalType, setModalType] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
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
            const token = localStorage.getItem('token');
            if (token && !myId) {
                try {
                    const me = await api.get('/usuarios/me');
                    setMyId(me.data.id);
                }
                catch (e) { }
            }
            const endpoint = isPublic ? `/usuarios/${id}` : '/usuarios/me';
            const res = await api.get(endpoint);
            setProfile(res.data);
            setIsFollowing(res.data.lo_sigo || false);
            setFollowersCount(res.data.seguidores_count ?? 0);
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
    const toggleFollow = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/usuarios/${id}/seguir`);
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
            }
            else {
                await api.post(`/usuarios/${id}/seguir`);
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar seguimiento');
        }
    };
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
            setShowEditModal(false);
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
    return (_jsxs("div", { className: "profile-container", style: { maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }, children: [_jsxs("div", { style: { background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color, #e0e0e0)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }, children: [!isPublic && (_jsx("button", { onClick: () => setShowEditModal(true), style: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }, children: "\u2699\uFE0F" })), _jsx("div", { style: { width: '90px', height: '90px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }, children: profile.foto_perfil ? (_jsx("img", { src: profile.foto_perfil, alt: profile.username, style: { width: '100%', height: '100%', objectFit: 'cover' } })) : ((profile.username || 'U').charAt(0).toUpperCase()) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h2", { style: { fontSize: '1.5rem', marginBottom: '0.2rem', color: 'var(--text-color)' }, children: profile.nombre || profile.username }), _jsxs("p", { style: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }, children: ["@", profile.username] }), _jsx("p", { style: { fontSize: '0.95rem', color: 'var(--text-color)', marginBottom: '0.75rem' }, children: profile.biografia || 'Sin biografía' }), _jsxs("div", { style: { display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600, alignItems: 'center' }, children: [_jsxs("span", { style: { cursor: 'pointer' }, onClick: () => setModalType('seguidores'), children: ["Seguidores: ", followersCount] }), _jsxs("span", { style: { cursor: 'pointer' }, onClick: () => setModalType('seguidos'), children: ["Seguidos: ", profile.seguidos_count ?? profile.seguidos?.length ?? 0] }), isPublic && isAuthenticated && myId && profile.id !== myId && (_jsx("button", { onClick: toggleFollow, className: isFollowing ? 'btn-secondary-outline' : 'btn-primary', style: { padding: '0.25rem 0.75rem', fontSize: '0.8rem' }, children: isFollowing ? 'Dejar de seguir' : 'Seguir' }))] })] })] }), showEditModal && (_jsx("div", { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }, onClick: () => setShowEditModal(false), children: _jsxs("div", { style: { background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }, onClick: e => e.stopPropagation(), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }, children: [_jsx("h3", { children: "Editar Perfil" }), _jsx("button", { onClick: () => setShowEditModal(false), children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleUpdate, children: [_jsx(FormInput, { label: "Nombre", name: "nombre", value: formData.nombre, onChange: e => setFormData({ ...formData, nombre: e.target.value }) }), _jsx(FormInput, { label: "Biograf\u00EDa", name: "biografia", value: formData.biografia, onChange: e => setFormData({ ...formData, biografia: e.target.value }) }), _jsx(FormInput, { label: "Foto", name: "foto", type: "file", onChange: handleFileChange }), _jsx("button", { type: "submit", className: "btn-primary", children: "Guardar" })] })] }) })), modalType && _jsx(FollowModal, { userId: profile.id, type: modalType, onClose: () => setModalType(null) }), _jsxs("div", { style: { marginTop: '2rem' }, children: [_jsx("h3", { style: { marginBottom: '1rem', fontSize: '1.2rem' }, children: isPublic ? `Ofertas publicadas por @${profile.username}` : 'Mis Ofertas Publicadas' }), (!profile.ofertas || profile.ofertas.length === 0) ? (_jsx(EmptyState, { title: "Sin ofertas", message: "Este usuario a\u00FAn no ha publicado ofertas comunitarias." })) : (_jsx("div", { style: { display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem' }, children: profile.ofertas.map((offer) => (_jsx("div", { style: { minWidth: '280px' }, children: _jsx(OfferCard, { offer: { ...offer, autor_username: profile.username } }) }, offer.id))) }))] })] }));
};
export default ProfilePage;
