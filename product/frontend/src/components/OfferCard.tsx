import React, { useState } from 'react';
import { RatingStars } from './RatingStars';

interface OfferCardProps {
  offer: { id: number; titulo: string; descripcion: string; ubicacion: string; precio: number; imagen?: string; foto?: string; autor_username?: string; autor?: string; calificacion: number; total_calificaciones: number; es_propia: boolean };
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const [promedio, setPromedio] = useState(offer.calificacion || 0);
  const [total, setTotal] = useState(offer.total_calificaciones || 0);
  const [imgError, setImgError] = useState(false);
  const autorNombre = offer.autor_username || offer.autor || 'Anónimo';

  const imageUrl = offer.imagen || offer.foto || '';

  const handleUpdateRating = (nuevoPromedio: number, nuevoTotal: number) => {
    setPromedio(nuevoPromedio);
    setTotal(nuevoTotal);
  };

  return (
    <div className="offer-card" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e0e0e0)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
            {autorNombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-color)' }}>{offer.titulo}</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{offer.ubicacion} • Autor: {autorNombre}</div>
          </div>
        </div>
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
          <RatingStars ofertaId={offer.id} initialRating={Math.round(promedio)} isOwner={offer.es_propia} onRate={handleUpdateRating} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>({promedio.toFixed(1)})</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{total} votos</span>
        </div>
      </div>
    </div>
  );
};
