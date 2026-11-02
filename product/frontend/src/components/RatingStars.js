import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import api from '../services/api';
export const RatingStars = ({ ofertaId, initialRating, isOwner, onRate }) => {
    const [rating, setRating] = useState(initialRating);
    const [errorMsg, setErrorMsg] = useState('');
    const handleRate = async (val) => {
        setErrorMsg('');
        if (isOwner) {
            setErrorMsg('No puedes calificar tu propia oferta');
            return;
        }
        try {
            const response = await api.post(`/ofertas/${ofertaId}/calificar`, { puntuacion: val });
            setRating(val);
            if (response.data) {
                onRate(response.data.promedio, response.data.total_calificaciones);
            }
        }
        catch (err) {
            const msg = err.response?.data?.detail || 'Error al calificar';
            setErrorMsg(typeof msg === 'string' ? msg : 'Error al calificar');
        }
    };
    return (_jsxs("div", { className: "rating-stars-container", style: { display: 'flex', flexDirection: 'column', gap: '0.2rem' }, children: [_jsx("div", { className: "rating-stars", style: { display: 'flex', gap: '2px', cursor: isOwner ? 'not-allowed' : 'pointer' }, children: [1, 2, 3, 4, 5].map((star) => (_jsx("span", { onClick: () => handleRate(star), style: { fontSize: '1.2rem', color: star <= rating ? '#FFD700' : '#e2e8f0', transition: 'color 0.2s' }, title: isOwner ? 'No puedes calificar tu propia oferta' : `Calificar con ${star} estrellas`, children: "\u2605" }, star))) }), errorMsg && _jsx("span", { style: { fontSize: '0.75rem', color: '#dc3545' }, role: "alert", children: errorMsg })] }));
};
