import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
export const FollowList = () => {
    const { id, type } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/usuarios/${id}/${type}`);
            setUsers(res.data);
        }
        catch (err) {
            if (err.response?.status === 403)
                setError('Esta lista es privada.');
            else
                setError('Error al cargar la lista.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, [id, type]);
    if (loading)
        return _jsx(LoadingState, {});
    if (error)
        return _jsx(ErrorState, { title: "Error", message: error, onRetry: fetchData });
    return (_jsxs("div", { style: { maxWidth: '600px', margin: '2rem auto' }, children: [_jsx("h2", { children: type === 'seguidores' ? 'Seguidores' : 'Seguidos' }), users.length === 0 ? (_jsx(EmptyState, { title: `Aún no ${type === 'seguidores' ? 'tiene seguidores' : 'sigue a nadie'}` })) : (users.map(u => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }, children: [_jsx("div", { style: { width: 40, height: 40, borderRadius: '50%', background: '#ccc', marginRight: '1rem' }, children: u.username[0].toUpperCase() }), _jsx(Link, { to: `/perfil/${u.id}`, style: { flex: 1, textDecoration: 'none', color: 'inherit' }, children: u.username })] }, u.id))))] }));
};
