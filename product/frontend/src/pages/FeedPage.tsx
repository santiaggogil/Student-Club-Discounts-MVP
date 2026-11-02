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
  const [orden, setOrden] = useState<'relevancia' | 'recientes'>('relevancia');

  const fetchOffers = async (reset = false, targetPage = page, currentOrden = orden) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/ofertas?page=${targetPage}&size=10&orden=${currentOrden}`);
      const data = res.data;
      if (Array.isArray(data)) {
        setOffers(prev => reset ? data : [...prev, ...data]);
        if (data.length < 10) setHasMore(false);
        else setHasMore(true);
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
    fetchOffers(page === 1, page, orden);
  }, [page, orden]);

  const handleOrdenChange = (newOrden: 'relevancia' | 'recientes') => {
    if (newOrden !== orden) {
      setOrden(newOrden);
      setPage(1);
    }
  };

  if (loading && offers.length === 0) return <LoadingState message="Cargando feed de ofertas..." />;
  if (error && offers.length === 0) return <ErrorState title="Error de conexión" message={error} onRetry={() => fetchOffers(true, 1, orden)} />;

  return (
    <div className="feed-container" style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color, #e0e0e0)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-color)' }}>Ordenar por:</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleOrdenChange('relevancia')}
            className={orden === 'relevancia' ? 'btn-primary' : 'btn-secondary-outline'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            Más relevantes
          </button>
          <button
            onClick={() => handleOrdenChange('recientes')}
            className={orden === 'recientes' ? 'btn-primary' : 'btn-secondary-outline'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            Más recientes
          </button>
        </div>
      </div>

      {offers.length === 0 && !loading ? (
        <EmptyState title="No hay ofertas" message="Sé el primero en publicar una oferta en la comunidad." actionText="Publicar oferta" onAction={() => window.location.href = '/publicar'} />
      ) : (
        <>
          {offers.map((o: any) => <OfferCard key={o.id} offer={o} />)}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setPage(p => p + 1)} className="btn-secondary-outline" style={{ padding: '0.6rem 2rem' }}>
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default FeedPage;
