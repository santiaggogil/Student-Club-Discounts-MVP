import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import api from '../services/api';

interface OfferCardProps {
  offer: {
    id: number;
    autor_id?: number;
    titulo: string;
    descripcion: string;
    ubicacion: string;
    precio: number;
    imagen?: string;
    foto?: string;
    autor_username?: string;
    autor?: string;
    calificacion: number;
    promedio_calificacion?: number;
    mi_calificacion?: number | null;
    total_calificaciones: number;
    es_propia?: boolean;
    vigente?: boolean;
    vence_en?: string;
    onDelete?: (id: number) => void;
  };
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const [promedio, setPromedio] = useState(offer.promedio_calificacion ?? offer.calificacion ?? 0);
  const [total, setTotal] = useState(offer.total_calificaciones || 0);
  const [miCalificacion, setMiCalificacion] = useState(offer.mi_calificacion || 0);
  const [imgError, setImgError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const autorNombre = offer.autor_username || offer.autor || 'Anónimo';
  const autorId = offer.autor_id;
  const imageUrl = offer.imagen || offer.foto || '';

  const getVigenciaLabel = () => {
    if (offer.vigente === false) return <span style={{ color: '#6c757d', fontWeight: 'bold' }}>Vencida</span>;
    if (!offer.vence_en) return null;
    const diff = new Date(offer.vence_en).getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 24 && hours >= 0) return <span>Vence hoy a las {new Date(offer.vence_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
    if (days > 0) return <span>Vence en {days} {days === 1 ? 'día' : 'días'}</span>;
    return <span>Vencida</span>;
  };

  let currentUser: any = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) currentUser = JSON.parse(userStr);
  } catch (e) {}

  const isOwnOffer = offer.es_propia || (currentUser && autorId && Number(currentUser.id) === Number(autorId));

  const handleUpdateRating = (nuevoPromedio: number, nuevoTotal: number, miNuevaCalificacion: number) => {
    setPromedio(nuevoPromedio);
    setTotal(nuevoTotal);
    setMiCalificacion(miNuevaCalificacion);
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
            <p style={{ fontFamily: 'var(--font-family)', color: 'var(--text-color)' }}>¿Seguro que quieres eliminar esta oferta? Esta acción no se puede deshacer</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} className="btn-secondary-outline">Cancelar</button>
              <button onClick={handleDelete} style={{ color: '#dc3545', border: '1px solid #dc3545', background: 'transparent', borderRadius: '20px', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-family)', fontWeight: 600 }}>Eliminar</button>
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Opciones de oferta"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.5rem', color: 'var(--text-muted, #6c757d)' }}
            >
              •••
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  backgroundColor: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-color, #e0e0e0)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  minWidth: '130px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <button onClick={() => { setMenuOpen(false); navigate(`/ofertas/${offer.id}/editar`); }} style={{ background: 'none', border: 'none', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-family)', color: 'var(--text-color, #333333)' }}>Editar</button>
                <button onClick={() => { setMenuOpen(false); setShowConfirm(true); }} style={{ background: 'none', border: 'none', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-family)', color: '#dc3545', fontWeight: 500 }}>Eliminar</button>
              </div>
            )}
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
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{getVigenciaLabel()}</div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '0.75rem' }}>{offer.descripcion}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color, #e0e0e0)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RatingStars ofertaId={offer.id} initialRating={miCalificacion} isOwner={!!isOwnOffer} onRate={handleUpdateRating} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>({promedio.toFixed(1)})</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{total} votos</span>
        </div>
      </div>
    </div>
  );
};
