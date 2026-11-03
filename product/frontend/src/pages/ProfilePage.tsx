import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { OfferCard } from '../components/OfferCard';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
import { FollowModal } from '../components/FollowModal';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isPublic = !!id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [modalType, setModalType] = useState<'seguidores' | 'seguidos' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    biografia: '',
    seguidores_privados: false,
    foto: null as File | null,
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isPublic ? `/usuarios/${id}` : '/usuarios/me';
      const res = await api.get(endpoint);
      setProfile(res.data);
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('biografia', formData.biografia);
      data.append('seguidores_privados', String(formData.seguidores_privados));
      if (formData.foto) data.append('foto', formData.foto);
      
      const res = await api.put('/usuarios/me', data);
      const updatedUser = res.data;
      setProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth-change'));
      setShowEditModal(false);
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || 'Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) return <LoadingState message="Cargando perfil..." />;
  if (error && !profile) return <ErrorState title="Error" message={error} onRetry={fetchProfile} />;
  if (!profile) return <EmptyState title="Usuario no encontrado" message="El perfil solicitado no existe." />;

  const ofertas = profile.ofertas_publicadas || profile.ofertas || [];

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
          </div>
        </div>
      </div>

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowEditModal(false)}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Editar Mi Perfil</h3>
              <button onClick={() => setShowEditModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            {saveError && <ErrorState title="Error" message={saveError} />}
            <form onSubmit={handleSaveProfile}>
              <FormInput label="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <FormInput label="Biografía" value={formData.biografia} onChange={e => setFormData({...formData, biografia: e.target.value})} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="checkbox" checked={formData.seguidores_privados} onChange={e => setFormData({...formData, seguidores_privados: e.target.checked})} />
                Seguidores privados
              </label>
              <input type="file" onChange={e => setFormData({...formData, foto: e.target.files?.[0] || null})} />
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalType && <FollowModal userId={profile.id} type={modalType} onClose={() => setModalType(null)} />}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{isPublic ? `Ofertas publicadas por @${profile.username}` : 'Mis Ofertas Publicadas'}</h3>
        {ofertas.length === 0 ? (
          <EmptyState title="Sin ofertas" message="Este usuario aún no ha publicado ofertas comunitarias." />
        ) : (
          <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem', scrollBehavior: 'smooth' }}>
            {ofertas.map((offer: any) => (
              <div key={offer.id} style={{ minWidth: '280px' }}><OfferCard offer={{ ...offer, autor_username: profile.username, autor_foto: profile.foto_perfil }} /></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;