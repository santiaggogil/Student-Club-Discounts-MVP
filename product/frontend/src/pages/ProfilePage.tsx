import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

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
      setFollowersCount(res.data.seguidores_count || 0);
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
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color, #e0e0e0)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }}>
          {profile.foto || profile.foto_url ? (
            <img src={profile.foto || profile.foto_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (profile.username || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', color: 'var(--text-color)' }}>
            {profile.nombre || profile.username}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>@{profile.username}</p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', marginBottom: '0.75rem' }}>
            {profile.biografia || 'Sin biografía'}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600, alignItems: 'center' }}>
            <span>Seguidores: {followersCount}</span>
            <span>Seguidos: {profile.seguidos_count ?? profile.seguidos?.length ?? 0}</span>
            {isPublic && isAuthenticated && myId && profile.id !== myId && (
              <button onClick={toggleFollow} className={isFollowing ? 'btn-secondary-outline' : 'btn-primary'} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div style={{ color: '#dc3545', background: '#f8d7da', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }} role="alert">{error}</div>}
      {successMsg && <div style={{ color: '#155724', background: '#d4edda', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{successMsg}</div>}

      {!isPublic && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color, #e0e0e0)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem' }}>Editar Mi Perfil</h3>
          <form onSubmit={handleUpdate} noValidate>
            <FormInput label="Nombre o Apodo" name="nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} error={errors.nombre} placeholder="Tu nombre real o apodo" />
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="biografia" className="form-label">Biografía (texto plano)</label>
              <textarea id="biografia" value={formData.biografia} onChange={e => setFormData({...formData, biografia: e.target.value})} className="form-control" rows={3} placeholder="Cuéntanos sobre ti..." />
              {errors.biografia && <span className="form-error" role="alert">{errors.biografia}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="foto" className="form-label">Foto de perfil</label>
              <input id="foto" type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="form-control" />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <input type="checkbox" id="seguidores_privados" checked={formData.seguidores_privados} onChange={e => setFormData({...formData, seguidores_privados: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="seguidores_privados" className="form-label" style={{ cursor: 'pointer', marginBottom: 0 }}>Hacer mi lista de seguidores privada</label>
            </div>
            <button type="submit" className="btn-primary" disabled={updating}>{updating ? 'Guardando...' : 'Guardar Cambios'}</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{isPublic ? `Ofertas publicadas por @${profile.username}` : 'Mis Ofertas Publicadas'}</h3>
        {(!profile.ofertas || profile.ofertas.length === 0) ? (
          <EmptyState title="Sin ofertas" message="Este usuario aún no ha publicado ofertas comunitarias." />
        ) : (
          profile.ofertas.map((offer: any) => (
            <OfferCard key={offer.id} offer={{ ...offer, autor_username: profile.username }} />
          ))
        )}
      </div>
    </div>
  );
};
export default ProfilePage;