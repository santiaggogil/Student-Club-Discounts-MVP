import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingState, ErrorState, EmptyState } from './StatusStates';
import { Link } from 'react-router-dom';

interface FollowModalProps {
  userId: number;
  type: 'seguidores' | 'seguidos';
  onClose: () => void;
}

export const FollowModal: React.FC<FollowModalProps> = ({ userId, type, onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.get(`/usuarios/${userId}/${type}`);
        setUsers(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Error al cargar la lista');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [userId, type]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={onClose}>
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{type === 'seguidores' ? 'Seguidores' : 'Seguidos'}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : users.length === 0 ? <EmptyState title={type === 'seguidores' ? 'Aún no tiene seguidores' : 'Aún no sigue a nadie'} /> : (
          users.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc', marginRight: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.username[0].toUpperCase()}</div>
              <Link to={`/perfil/${u.id}`} onClick={onClose} style={{ textDecoration: 'none', color: 'inherit' }}>{u.username}</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};