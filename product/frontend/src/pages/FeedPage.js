import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
export const FeedPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const fetchOffers = async (reset = false) => {
        setLoading(true);
        setError('');
        try {
            const currentPage = reset ? 1 : page;
            const res = await api.get(`/ofertas?page=${currentPage}&size=10`);
            const data = res.data;
            if (Array.isArray(data)) {
                setOffers(prev => reset ? data : [...prev, ...data]);
                if (data.length < 10)
                    setHasMore(false);
            }
            else {
                setOffers([]);
            }
        }
        catch (e) {
            setError(e.response?.data?.detail || 'Error al cargar el feed de ofertas');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOffers(page === 1);
    }, [page]);
    if (loading && offers.length === 0)
        return _jsx(LoadingState, { message: "Cargando feed de ofertas..." });
    if (error && offers.length === 0)
        return _jsx(ErrorState, { title: "Error de conexi\u00F3n", message: error, onRetry: () => fetchOffers(true) });
    if (offers.length === 0 && !loading)
        return _jsx(EmptyState, { title: "No hay ofertas", message: "S\u00E9 el primero en publicar una oferta en la comunidad.", actionText: "Publicar oferta", onAction: () => window.location.href = '/publicar' });
    return (_jsxs("div", { className: "feed-container", style: { maxWidth: '680px', margin: '0 auto', paddingBottom: '2rem' }, children: [_jsxs("div", { style: { marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx("div", { style: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: "\uD83D\uDC64" }), _jsx("a", { href: "/publicar", style: { flex: 1, textDecoration: 'none', color: 'var(--text-muted)', background: '#f8f9fa', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)' }, children: "\u00BFEncontraste un nuevo descuento o corrientazo? Comp\u00E1rtelo..." })] }), offers.map((o) => _jsx(OfferCard, { offer: o }, o.id)), hasMore && (_jsx("div", { style: { textAlign: 'center', marginTop: '1.5rem' }, children: _jsx("button", { onClick: () => setPage(p => p + 1), className: "btn-secondary-outline", style: { padding: '0.6rem 2rem' }, children: loading ? 'Cargando...' : 'Cargar más' }) }))] }));
};
export default FeedPage;
