import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingState, ErrorState, EmptyState } from './StatusStates';
import { Link } from 'react-router-dom';
export const FollowModal = ({ userId, type, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await api.get(`/usuarios/${userId}/${type}`);
                setUsers(res.data);
            }
            catch (err) {
                setError(err.response?.data?.detail || 'Error al cargar la lista');
            }
            finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [userId, type]);
    return (_jsx("div", { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }, onClick: onClose, children: _jsxs("div", { style: { background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }, onClick: e => e.stopPropagation(), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }, children: [_jsx("h3", { style: { margin: 0 }, children: type === 'seguidores' ? 'Seguidores' : 'Seguidos' }), _jsx("button", { onClick: onClose, style: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }, children: "\u00D7" })] }), loading ? _jsx(LoadingState, {}) : error ? _jsx(ErrorState, { message: error }) : users.length === 0 ? _jsx(EmptyState, { title: type === 'seguidores' ? 'Aún no tiene seguidores' : 'Aún no sigue a nadie' }) : (users.map(u => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', padding: '0.5rem 0' }, children: [_jsx("div", { style: { width: 32, height: 32, borderRadius: '50%', background: '#ccc', marginRight: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: u.username[0].toUpperCase() }), _jsx(Link, { to: `/perfil/${u.id}`, onClick: onClose, style: { textDecoration: 'none', color: 'inherit' }, children: u.username })] }, u.id))))] }) }));
};
