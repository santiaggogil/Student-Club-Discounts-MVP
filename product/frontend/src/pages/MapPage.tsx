import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../services/api';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

interface OfertaSupermercado {
  producto: string;
  precio: number;
  vigencia: string;
}

interface SedeOferta {
  cadena: string;
  nombre: string;
  latitud: number;
  longitud: number;
  ofertas: OfertaSupermercado[];
}

export const MapPage: React.FC = () => {
  const [sedes, setSedes] = useState<SedeOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMapaOfertas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/mapa/ofertas');
      if (Array.isArray(response.data)) {
        setSedes(response.data);
      } else {
        setSedes([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar el mapa de ofertas de supermercados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapaOfertas();
  }, []);

  if (loading) {
    return <LoadingState message="Cargando mapa de ofertas en Manizales..." />;
  }

  if (error) {
    return <ErrorState title="Error al cargar el mapa" message={error} onRetry={fetchMapaOfertas} />;
  }

  if (sedes.length === 0) {
    return (
      <EmptyState
        title="Sin ofertas disponibles"
        message="Aún no hay ofertas de supermercados"
        actionText="Actualizar"
        onAction={fetchMapaOfertas}
      />
    );
  }

  const manizalesCenter: [number, number] = [5.0689, -75.5174];

  return (
    <div className="map-page-container" style={{ height: 'calc(100vh - 120px)', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color, #e0e0e0)' }}>
      <MapContainer
        center={manizalesCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sedes.map((sede, idx) => (
          <Marker key={idx} position={[sede.latitud, sede.longitud]}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary-blue, #0056b3)' }}>{sede.cadena}</h4>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#333' }}>{sede.nombre}</p>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {sede.ofertas.map((of, i) => (
                    <div key={i} style={{ borderTop: '1px solid #eee', padding: '4px 0', fontSize: '0.8rem' }}>
                      <strong>{of.producto}</strong>
                      <div style={{ color: '#0056b3', fontWeight: 'bold' }}>${Number(of.precio).toLocaleString()}</div>
                      <div style={{ color: '#666', fontSize: '0.7rem' }}>Válido hasta: {new Date(of.vigencia).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
