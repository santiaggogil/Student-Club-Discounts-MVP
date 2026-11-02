import React, { useState } from 'react';
import api from '../services/api';

interface RatingStarsProps {
  ofertaId: number;
  initialRating: number;
  isOwner: boolean;
  onRate: (newRating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ ofertaId, initialRating, isOwner, onRate }) => {
  const [rating, setRating] = useState(initialRating);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRate = async (val: number) => {
    setErrorMsg('');
    if (isOwner) {
      setErrorMsg('No puedes calificar tu propia oferta');
      return;
    }
    try {
      const response = await api.post(`/ofertas/${ofertaId}/calificar`, { puntuacion: val });
      setRating(val);
      if (response.data && typeof response.data.promedio === 'number') {
        onRate(response.data.promedio);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Error al calificar';
      setErrorMsg(typeof msg === 'string' ? msg : 'Error al calificar');
    }
  };

  return (
    <div className="rating-stars-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <div className="rating-stars" style={{ display: 'flex', gap: '2px', cursor: isOwner ? 'not-allowed' : 'pointer' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleRate(star)}
            style={{
              fontSize: '1.2rem',
              color: star <= rating ? '#FFD700' : '#e2e8f0',
              transition: 'color 0.2s'
            }}
            title={isOwner ? 'No puedes calificar tu propia oferta' : `Calificar con ${star} estrellas`}
          >
            ★
          </span>
        ))}
      </div>
      {errorMsg && <span style={{ fontSize: '0.75rem', color: '#dc3545' }} role="alert">{errorMsg}</span>}
    </div>
  );
};