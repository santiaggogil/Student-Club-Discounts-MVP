import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
import { FollowModal } from '../components/FollowModal';
export const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isPublic = !!id;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [followersCount, setFollowersCount] = useState(0);
    const [loSigo, setLoSigo] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [tgStatus, setTgStatus] = useState(null);
    const [tgLoading, setTgLoading] = useState(false);
    const [tgError, setTgError] = useState('');
    let currentUserId = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const u = JSON.parse(userStr);
            currentUserId = u.id !== undefined ? Number(u.id) : null;
        }
    }
    catch (e) { }
    const isOwnProfile = !isPublic || (currentUserId !== null && profile && Number(profile.id) === currentUserId);
    const [formData, setFormData] = useState({
        nombre: '',
        biografia: '',
        seguidores_privados: false,
        foto: null,
    });
    const fetchTelegramStatus = async () => {
        setTgLoading(true);
        setTgError('');
        try {
            const res = await api.get('/telegram/estado');
            setTgStatus(res.data);
        }
        catch (err) {
            setTgError(err.response?.data?.error || 'Error al consultar Telegram');
        }
        finally {
            setTgLoading(false);
        }
    };
    const handleVincular = async () => {
        try {
            const res = await api.post('/telegram/vincular');
            window.open(res.data.enlace, '_blank');
        }
        catch (err) {
            setTgError(err.response?.data?.error || 'Error al vincular');
        }
    };
    const handleDesvincular = async () => {
        try {
            await api.delete('/telegram/vincular');
            await fetchTelegramStatus();
        }
        catch (err) {
            setTgError(err.response?.data?.error || 'Error al desvincular');
        }
    };
    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const endpoint = isPublic ? `/usuarios/${id}` : '/usuarios/me';
            const res = await api.get(endpoint);
            setProfile(res.data);
            setFollowersCount(res.data.seguidores_count ?? 0);
            setLoSigo(!!res.data.lo_sigo);
            if (!isPublic || (currentUserId !== null && Number(res.data.id) === currentUserId)) {
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
    const handleToggleFollow = async () => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        if (!profile)
            return;
        try {
            if (loSigo) {
                await api.delete(`/usuarios/${profile.id}/seguir`);
                setLoSigo(false);
                setFollowersCount((prev) => Math.max(0, prev - 1));
            }
            else {
                await api.post(`/usuarios/${profile.id}/seguir`);
                setLoSigo(true);
                setFollowersCount((prev) => prev + 1);
            }
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Error al actualizar seguimiento');
        }
    };
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError('');
        try {
            const data = new FormData();
            data.append('nombre', formData.nombre);
            data.append('biografia', formData.biografia);
            data.append('seguidores_privados', String(formData.seguidores_privados));
            if (formData.foto) {
                data.append('foto', formData.foto);
            }
            const res = await api.put('/usuarios/me', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = res.data;
            setProfile(updatedUser);
            const existingUserStr = localStorage.getItem('user');
            let mergedUser = updatedUser;
            if (existingUserStr) {
                try {
                    const oldU = JSON.parse(existingUserStr);
                    mergedUser = { ...oldU, ...updatedUser };
                }
                catch (e) { }
            }
            localStorage.setItem('user', JSON.stringify(mergedUser));
            window.dispatchEvent(new Event('auth-change'));
            setShowEditModal(false);
        }
        catch (err) {
            setSaveError(err.response?.data?.detail || 'Error al guardar perfil');
        }
        finally {
            setSaving(false);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, [id]);
    useEffect(() => {
        if (showEditModal)
            fetchTelegramStatus();
    }, [showEditModal]);
    if (loading)
        return _jsx(LoadingState, { message: "Cargando perfil..." });
    if (error && !profile)
        return _jsx(ErrorState, { title: "Error", message: error, onRetry: fetchProfile });
    if (!profile)
        return _jsx(EmptyState, { title: "Usuario no encontrado", message: "El perfil solicitado no existe." });
    const ofertas = profile.ofertas_publicadas || profile.ofertas || [];
    return (_jsxs("div", { className: "profile-container", style: { maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }, children: [_jsxs("div", { style: { background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color, #e0e0e0)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }, children: [isOwnProfile && (_jsx("button", { onClick: () => setShowEditModal(true), "aria-label": "Configurar perfil", style: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }, children: "\u2699\uFE0F" })), _jsx("div", { style: { width: '90px', height: '90px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }, children: profile.foto_perfil ? (_jsx("img", { src: profile.foto_perfil, alt: profile.username, style: { width: '100%', height: '100%', objectFit: 'cover' } })) : ((profile.username || 'U').charAt(0).toUpperCase()) }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("h2", { style: { fontSize: '1.5rem', marginBottom: '0.2rem', color: 'var(--text-color)' }, children: profile.nombre || profile.username }), _jsxs("p", { style: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }, children: ["@", profile.username] })] }), !isOwnProfile && localStorage.getItem('token') && (_jsx("button", { onClick: handleToggleFollow, className: loSigo ? 'btn-secondary-outline' : 'btn-primary', style: { padding: '0.5rem 1.25rem', fontSize: '0.9rem' }, children: loSigo ? 'Dejar de seguir' : 'Seguir' }))] }), _jsx("p", { style: { fontSize: '0.95rem', color: 'var(--text-color)', marginBottom: '0.75rem' }, children: profile.biografia || 'Sin biografía' }), _jsxs("div", { style: { display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600, alignItems: 'center' }, children: [_jsxs("span", { style: { cursor: 'pointer' }, onClick: () => setModalType('seguidores'), children: ["Seguidores: ", followersCount] }), _jsxs("span", { style: { cursor: 'pointer' }, onClick: () => setModalType('seguidos'), children: ["Seguidos: ", profile.seguidos_count ?? profile.seguidos?.length ?? 0] })] })] })] }), showEditModal && (_jsx("div", { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }, onClick: () => setShowEditModal(false), children: _jsxs("div", { style: { background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }, onClick: e => e.stopPropagation(), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }, children: [_jsx("h3", { children: "Editar Mi Perfil" }), _jsx("button", { onClick: () => setShowEditModal(false), style: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }, children: "\u00D7" })] }), saveError && _jsx(ErrorState, { title: "Error", message: saveError }), _jsxs("form", { onSubmit: handleSaveProfile, children: [_jsx(FormInput, { label: "Nombre", value: formData.nombre, onChange: e => setFormData({ ...formData, nombre: e.target.value }) }), _jsx(FormInput, { label: "Biograf\u00EDa", value: formData.biografia, onChange: e => setFormData({ ...formData, biografia: e.target.value }) }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }, children: [_jsx("input", { type: "checkbox", checked: formData.seguidores_privados, onChange: e => setFormData({ ...formData, seguidores_privados: e.target.checked }) }), "Seguidores privados"] }), _jsx("input", { type: "file", onChange: e => setFormData({ ...formData, foto: e.target.files?.[0] || null }) }), _jsxs("div", { style: { marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }, children: [_jsx("h4", { children: "Telegram" }), tgLoading ? _jsx(LoadingState, {}) : tgError ? _jsx(ErrorState, { message: tgError, onRetry: fetchTelegramStatus }) : tgStatus?.vinculado ? (_jsxs("div", { children: [_jsxs("p", { children: ["Vinculado como @", tgStatus.usuario_telegram] }), _jsx("button", { onClick: handleDesvincular, className: "btn-secondary-outline", style: { color: '#dc3545', borderColor: '#dc3545' }, children: "Desvincular" })] })) : (_jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [_jsx("button", { onClick: handleVincular, className: "btn-primary", children: "Vincular con Telegram" }), _jsx("button", { onClick: fetchTelegramStatus, className: "btn-secondary-outline", children: "Ya lo vincul\u00E9" })] }))] }), _jsx("button", { type: "submit", className: "btn-primary", style: { width: '100%', marginTop: '1rem' }, disabled: saving, children: saving ? 'Guardando...' : 'Guardar Cambios' })] })] }) })), modalType && _jsx(FollowModal, { userId: profile.id, type: modalType, onClose: () => setModalType(null) }), _jsxs("div", { style: { marginTop: '2rem' }, children: [_jsx("h3", { style: { marginBottom: '1rem', fontSize: '1.2rem' }, children: isPublic ? `Ofertas publicadas por @${profile.username}` : 'Mis Ofertas Publicadas' }), ofertas.length === 0 ? (_jsx(EmptyState, { title: "Sin ofertas", message: "Este usuario a\u00FAn no ha publicado ofertas comunitarias." })) : (_jsx("div", { style: { display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem', scrollBehavior: 'smooth' }, children: ofertas.map((offer) => (_jsx("div", { style: { minWidth: '280px' }, children: _jsx(OfferCard, { offer: { ...offer, autor_username: profile.username, autor_foto: profile.foto_perfil } }) }, offer.id))) }))] })] }));
};
export default ProfilePage;
