import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
export const RatingStars = ({ ofertaId, initialRating, isOwner, onRate }) => {
    const [rating, setRating] = useState(initialRating);
    const handleRate = async (val) => {
        if (isOwner)
            return;
        try {
            const response = await import('../services/api').then(m => m.default.post(`/ofertas/${ofertaId}/calificar`, { puntuacion: val }));
            setRating(val);
            onRate(response.data.promedio);
        }
        catch (err) {
            if (err.response?.status === 401)
                alert('Debes iniciar sesión para calificar');
            else if (err.response?.status === 400)
                alert('No puedes calificar tu propia oferta');
            else
                alert('Error al calificar');
        }
    };
    return (_jsx("div", { className: "rating-stars", children: [1, 2, 3, 4, 5].map((star) => (_jsx("span", { onClick: () => handleRate(star), style: { cursor: isOwner ? 'default' : 'pointer', color: star <= rating ? '#FFD700' : '#ccc' }, children: "\u2605" }, star))) }));
};
