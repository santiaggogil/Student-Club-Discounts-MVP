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
    const fetchOffers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/ofertas?page=${page}&size=10`);
            setOffers(res.data);
        }
        catch (e) {
            setError('Error al cargar ofertas');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchOffers(); }, [page]);
    if (loading)
        return _jsx(LoadingState, {});
    if (error)
        return _jsx(ErrorState, { message: error, onRetry: fetchOffers });
    if (offers.length === 0)
        return _jsx(EmptyState, { title: "No hay ofertas", message: "S\u00E9 el primero en publicar una." });
    return (_jsxs("div", { className: "feed-container", children: [offers.map((o) => _jsx(OfferCard, { offer: o }, o.id)), _jsx("button", { onClick: () => setPage(p => p + 1), children: "Cargar m\u00E1s" })] }));
};
