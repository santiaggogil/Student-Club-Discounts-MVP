import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

export const FeedPage: React.FC = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ofertas?page=${page}&size=10`);
      setOffers(res.data);
    } catch (e) { setError('Error al cargar ofertas'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOffers(); }, [page]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchOffers} />;
  if (offers.length === 0) return <EmptyState title="No hay ofertas" message="Sé el primero en publicar una." />;

  return (
    <div className="feed-container">
      {offers.map((o: any) => <OfferCard key={o.id} offer={o} />)}
      <button onClick={() => setPage(p => p + 1)}>Cargar más</button>
    </div>
  );
};