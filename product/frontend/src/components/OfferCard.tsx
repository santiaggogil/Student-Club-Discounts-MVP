import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import api from '../services/api';

interface OfferCardProps {
  offer: { id: number; autor_id?: number; titulo: string; descripcion: string; ubicacion: string; precio: number; imagen?: string; foto?: string; autor_username?: string; autor?: string; calificacion: number; total_calificaciones: number; es_propia?: boolean; onDelete?: (id: number) => void };
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const [promedio, setPromedio] = useState(offer.calificacion || 0);
  const [total, setTotal] = useState(offer.total_calificaciones || 0);
  const [imgError, setImgError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const autorNombre = offer.autor_username || offer.autor || 'Anónimo';
  const autorId = offer.autor_id;
  const imageUrl = offer.imagen || offer.foto || '';

  let currentUser: any = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) currentUser = JSON.parse(userStr);
  } catch (e) {}

  const isOwnOffer = offer.es_propia || (currentUser && autorId && Number(currentUser.id) === Number(autorId));

  const handleUpdateRating = (nuevoPromedio: number, nuevoTotal: number) => {
    setPromedio(nuevoPromedio);
    setTotal(nuevoTotal);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/ofertas/${offer.id}`);
      if (offer.onDelete) offer.onDelete(offer.id);
      else window.location.reload();
    } catch (err) {
      alert('Error al eliminar la oferta');
    }
    setShowConfirm(false);
  };

  return (
    <div className="offer-card" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e0e0e0)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}>
      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', maxWidth: '400px' }}>
            <p>¿Seguro que quieres eliminar esta oferta? Esta acción no se puede deshacer</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button onClick={handleDelete} style={{ color: 'red' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
            {autorNombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-color)' }}>{offer.titulo}</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {offer.ubicacion} • Autor: {' '}
              {autorId ? (
                <Link to={`/perfil/${autorId}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600 }}>
                  {autorNombre}
                </Link>
              ) : (
                autorNombre
              )}
            </div>
          </div>
        </div>
        {isOwnOffer && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigate(`/ofertas/${offer.id}/editar`)} style={{ border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', background: 'transparent', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>Editar</button>
            <button onClick={() => setShowConfirm(true)} style={{ border: 'none', color: 'red', background: 'transparent', cursor: 'pointer' }}>Eliminar</button>
          </div>
        )}
      </div>

      {imageUrl && !imgError ? (
        <img 
          src={imageUrl} 
          alt={offer.titulo} 
          onError={() => setImgError(true)} 
          style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} 
        />
      ) : (
        <div data-testid="image-error-fallback" style={{ width: '100%', height: '220px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Imagen no disponible
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-blue, #0056b3)' }}>
          ${Number(offer.precio).toLocaleString()}
        </span>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '0.75rem' }}>{offer.descripcion}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color, #e0e0e0)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RatingStars ofertaId={offer.id} initialRating={Math.round(promedio)} isOwner={!!isOwnOffer} onRate={handleUpdateRating} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>({promedio.toFixed(1)})</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{total} votos</span>
        </div>
      </div>
    </div>
  );
};
