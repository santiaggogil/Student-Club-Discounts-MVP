import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

export const FollowList: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: 'seguidores' | 'seguidos' }>();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/usuarios/${id}/${type}`);
      setUsers(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) setError('Esta lista es privada.');
      else setError('Error al cargar la lista.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, type]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState title="Error" message={error} onRetry={fetchData} />;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>{type === 'seguidores' ? 'Seguidores' : 'Seguidos'}</h2>
      {users.length === 0 ? (
        <EmptyState title={`Aún no ${type === 'seguidores' ? 'tiene seguidores' : 'sigue a nadie'}`} />
      ) : (
        users.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccc', marginRight: '1rem' }}>{u.username[0].toUpperCase()}</div>
            <Link to={`/perfil/${u.id}`} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>{u.username}</Link>
          </div>
        ))
      )}
    </div>
  );
};