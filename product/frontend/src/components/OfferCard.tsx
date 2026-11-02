import React, { useState } from 'react';
import { RatingStars } from './RatingStars';

interface OfferCardProps {
  offer: { id: number; titulo: string; descripcion: string; ubicacion: string; precio: number; foto: string; autor: string; calificacion: number; es_propia: boolean };
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const [promedio, setPromedio] = useState(offer.calificacion);
  return (
    <div className="offer-card" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
      <img src={offer.foto} alt={offer.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
      <h3>{offer.titulo}</h3>
      <p>{offer.descripcion}</p>
      <p><strong>Ubicación:</strong> {offer.ubicacion}</p>
      <p><strong>Precio:</strong> ${offer.precio}</p>
      <p><strong>Autor:</strong> {offer.autor} | <strong>Calificación:</strong> {promedio}⭐</p>
      <RatingStars ofertaId={offer.id} initialRating={0} isOwner={offer.es_propia} onRate={setPromedio} />
    </div>
  );
};