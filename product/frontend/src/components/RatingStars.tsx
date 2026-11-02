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

  const handleRate = async (val: number) => {
    if (isOwner) return;
    try {
      const response = await api.post(`/ofertas/${ofertaId}/calificar`, { puntuacion: val });
      setRating(val);
      onRate(response.data.promedio);
    } catch (err: any) {
      if (err.response?.status === 401) alert('Debes iniciar sesión para calificar');
      else if (err.response?.status === 400) alert('No puedes calificar tu propia oferta');
      else alert('Error al calificar');
    }
  };

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} onClick={() => handleRate(star)} style={{ cursor: isOwner ? 'default' : 'pointer', color: star <= rating ? '#FFD700' : '#ccc' }}>
          ★
        </span>
      ))}
    </div>
  );
};