import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

export const FeedPage: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOffers = async (reset = false) => {
    setLoading(true);
    setError('');
    try {
      const currentPage = reset ? 1 : page;
      const res = await api.get(`/ofertas?page=${currentPage}&size=10`);
      const data = res.data;
      if (Array.isArray(data)) {
        setOffers(prev => reset ? data : [...prev, ...data]);
        if (data.length < 10) setHasMore(false);
      } else {
        setOffers([]);
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Error al cargar el feed de ofertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(page === 1);
  }, [page]);

  if (loading && offers.length === 0) return <LoadingState message="Cargando feed de ofertas..." />;
  if (error && offers.length === 0) return <ErrorState title="Error de conexión" message={error} onRetry={() => fetchOffers(true)} />;
  if (offers.length === 0 && !loading) return <EmptyState title="No hay ofertas" message="Sé el primero en publicar una oferta en la comunidad." actionText="Publicar oferta" onAction={() => window.location.href = '/publicar'} />;

  return (
    <div className="feed-container" style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '2rem' }}>
      {offers.map((o: any) => <OfferCard key={o.id} offer={o} />)}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => p + 1)} className="btn-secondary-outline" style={{ padding: '0.6rem 2rem' }}>
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
};
export default FeedPage;