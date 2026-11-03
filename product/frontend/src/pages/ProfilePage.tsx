import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
import { FollowModal } from '../components/FollowModal';

const profileUpdateSchema = z.object({
  nombre: z.string().max(100, 'Máximo 100 caracteres').optional(),
  biografia: z.string().max(500, 'Máximo 500 caracteres').optional(),
  seguidores_privados: z.boolean().optional(),
});

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isPublic = !!id;
  const [isAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [myId, setMyId] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [modalType, setModalType] = useState<'seguidores' | 'seguidos' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    biografia: '',
    seguidores_privados: false,
    foto: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (token && !myId) {
        try {
          const me = await api.get('/usuarios/me');
          setMyId(me.data.id);
        } catch (e) {}
      }
      const endpoint = isPublic ? `/usuarios/${id}` : '/usuarios/me';
      const res = await api.get(endpoint);
      setProfile(res.data);
      setIsFollowing(res.data.lo_sigo || false);
      setFollowersCount(res.data.seguidores_count ?? 0);
      if (!isPublic) {
        setFormData({
          nombre: res.data.nombre || '',
          biografia: res.data.biografia || '',
          seguidores_privados: !!res.data.seguidores_privados,
          foto: null,
        });
      }
    } catch (err: any) {
      if (err.response?.status === 401 && !isPublic) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Error al cargar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/usuarios/${id}/seguir`);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await api.post(`/usuarios/${id}/seguir`);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar seguimiento');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, foto: e.target.files![0] }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const result = profileUpdateSchema.safeParse({
      nombre: formData.nombre,
      biografia: formData.biografia,
      seguidores_privados: formData.seguidores_privados,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setUpdating(true);

    const data = new FormData();
    if (formData.nombre !== undefined) data.append('nombre', formData.nombre);
    if (formData.biografia !== undefined) data.append('biografia', formData.biografia);
    data.append('seguidores_privados', String(formData.seguidores_privados));
    if (formData.foto) data.append('foto', formData.foto);

    try {
      const res = await api.put('/usuarios/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      setSuccessMsg('Perfil actualizado exitosamente');
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState message="Cargando perfil..." />;
  if (error && !profile) return <ErrorState title="Error" message={error} onRetry={fetchProfile} />;
  if (!profile) return <EmptyState title="Usuario no encontrado" message="El perfil solicitado no existe." />;

  return (
    <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color, #e0e0e0)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }}>
        {!isPublic && (
          <button onClick={() => setShowEditModal(true)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>⚙️</button>
        )}
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }}>
          {profile.foto_perfil ? (
            <img src={profile.foto_perfil} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (profile.username || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', color: 'var(--text-color)' }}>{profile.nombre || profile.username}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>@{profile.username}</p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', marginBottom: '0.75rem' }}>{profile.biografia || 'Sin biografía'}</p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600, alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setModalType('seguidores')}>Seguidores: {followersCount}</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setModalType('seguidos')}>Seguidos: {profile.seguidos_count ?? profile.seguidos?.length ?? 0}</span>
            {isPublic && isAuthenticated && myId && profile.id !== myId && (
              <button onClick={toggleFollow} className={isFollowing ? 'btn-secondary-outline' : 'btn-primary'} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>{isFollowing ? 'Dejar de seguir' : 'Seguir'}</button>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={() => setShowEditModal(false)}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><h3>Editar Perfil</h3><button onClick={() => setShowEditModal(false)}>×</button></div>
            <form onSubmit={handleUpdate}>
              <FormInput label="Nombre" name="nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <FormInput label="Biografía" name="biografia" value={formData.biografia} onChange={e => setFormData({...formData, biografia: e.target.value})} />
              <FormInput label="Foto" name="foto" type="file" onChange={handleFileChange} />
              <button type="submit" className="btn-primary">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {modalType && <FollowModal userId={profile.id} type={modalType} onClose={() => setModalType(null)} />}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{isPublic ? `Ofertas publicadas por @${profile.username}` : 'Mis Ofertas Publicadas'}</h3>
        {(!profile.ofertas || profile.ofertas.length === 0) ? (
          <EmptyState title="Sin ofertas" message="Este usuario aún no ha publicado ofertas comunitarias." />
        ) : (
          <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem' }}>
            {profile.ofertas.map((offer: any) => (
              <div key={offer.id} style={{ minWidth: '280px' }}><OfferCard offer={{ ...offer, autor_username: profile.username }} /></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;