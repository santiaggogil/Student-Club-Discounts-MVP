import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { RatingStars } from './RatingStars';
export const OfferCard = ({ offer }) => {
    const [promedio, setPromedio] = useState(offer.calificacion);
    return (_jsxs("div", { className: "offer-card", style: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }, children: [_jsx("img", { src: offer.foto, alt: offer.titulo, style: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' } }), _jsx("h3", { children: offer.titulo }), _jsx("p", { children: offer.descripcion }), _jsxs("p", { children: [_jsx("strong", { children: "Ubicaci\u00F3n:" }), " ", offer.ubicacion] }), _jsxs("p", { children: [_jsx("strong", { children: "Precio:" }), " $", offer.precio] }), _jsxs("p", { children: [_jsx("strong", { children: "Autor:" }), " ", offer.autor, " | ", _jsx("strong", { children: "Calificaci\u00F3n:" }), " ", promedio, "\u2B50"] }), _jsx(RatingStars, { ofertaId: offer.id, initialRating: 0, isOwner: offer.es_propia, onRate: setPromedio })] }));
};
