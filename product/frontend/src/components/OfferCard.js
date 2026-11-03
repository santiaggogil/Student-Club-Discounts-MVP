import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import api from '../services/api';
export const OfferCard = ({ offer }) => {
    const [promedio, setPromedio] = useState(offer.calificacion || 0);
    const [total, setTotal] = useState(offer.total_calificaciones || 0);
    const [imgError, setImgError] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();
    const autorNombre = offer.autor_username || offer.autor || 'Anónimo';
    const autorId = offer.autor_id;
    const imageUrl = offer.imagen || offer.foto || '';
    // Obtener usuario autenticado de localStorage
    let currentUser = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr)
            currentUser = JSON.parse(userStr);
    }
    catch (e) { }
    const isOwnOffer = offer.es_propia || (currentUser && autorId && Number(currentUser.id) === Number(autorId));
    const handleUpdateRating = (nuevoPromedio, nuevoTotal) => {
        setPromedio(nuevoPromedio);
        setTotal(nuevoTotal);
    };
    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de eliminar esta oferta?')) {
            try {
                await api.delete(`/ofertas/${offer.id}`);
                if (offer.onDelete)
                    offer.onDelete(offer.id);
                else
                    window.location.reload();
            }
            catch (err) {
                alert('Error al eliminar la oferta');
            }
        }
    };
    return (_jsxs("div", { className: "offer-card", style: { background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e0e0e0)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }, children: [isOwnOffer && (_jsxs("div", { style: { position: 'absolute', top: '10px', right: '10px' }, children: [_jsx("button", { onClick: () => setShowMenu(!showMenu), "aria-label": "Opciones de oferta", style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }, children: "\u22EE" }), showMenu && (_jsxs("div", { style: { position: 'absolute', right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '0.5rem', zIndex: 10 }, children: [_jsx("button", { onClick: () => navigate(`/ofertas/${offer.id}/editar`), style: { display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }, children: "Editar" }), _jsx("button", { onClick: handleDelete, style: { display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'red' }, children: "Eliminar" })] }))] })), _jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx("div", { style: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }, children: autorNombre.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("span", { style: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-color)' }, children: offer.titulo }), _jsxs("div", { style: { fontSize: '0.8rem', color: 'var(--text-muted)' }, children: [offer.ubicacion, " \u2022 Autor: ", ' ', autorId ? (_jsx(Link, { to: `/perfil/${autorId}`, style: { color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600 }, children: autorNombre })) : (autorNombre)] })] })] }) }), imageUrl && !imgError ? (_jsx("img", { src: imageUrl, alt: offer.titulo, onError: () => setImgError(true), style: { width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' } })) : (_jsx("div", { "data-testid": "image-error-fallback", style: { width: '100%', height: '220px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }, children: "Imagen no disponible" })), _jsx("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }, children: _jsxs("span", { style: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-blue, #0056b3)' }, children: ["$", Number(offer.precio).toLocaleString()] }) }), _jsx("p", { style: { fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '0.75rem' }, children: offer.descripcion }), _jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color, #e0e0e0)', paddingTop: '0.75rem' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(RatingStars, { ofertaId: offer.id, initialRating: Math.round(promedio), isOwner: !!isOwnOffer, onRate: handleUpdateRating }), _jsxs("span", { style: { fontSize: '0.85rem', fontWeight: 600 }, children: ["(", promedio.toFixed(1), ")"] }), _jsxs("span", { style: { fontSize: '0.8rem', color: 'var(--text-muted)' }, children: [total, " votos"] })] }) })] }));
};
