import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';

const loginSchema = z.object({
  identifier: z.string().min(1, 'El correo o usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('token_timestamp', Date.now().toString());
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setServerError('Credenciales incorrectas');
      } else {
        setServerError(err.response?.data?.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Iniciando sesión..." />;

  return (
    <div className="auth-container" style={{ maxWidth: '420px', margin: '2rem auto', background: 'var(--card-bg, #fff)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color, #e0e0e0)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <span className="brand-badge" style={{ fontSize: '1rem', padding: '4px 8px' }}>SCD</span>
        <h2 style={{ marginTop: '0.5rem', fontSize: '1.4rem' }}>Student Club Discounts</h2>
        <p style={{ color: 'var(--text-muted, #6c757d)', fontSize: '0.9rem' }}>El hub inteligente de ahorro universitario</p>
      </div>

      {serverError && <ErrorState title="Acceso denegado" message={serverError} onRetry={() => setServerError('')} />}

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Correo electrónico"
          name="identifier"
          value={formData.identifier}
          onChange={e => setFormData({ ...formData, identifier: e.target.value })}
          error={errors.identifier}
          placeholder="correo@ejemplo.com"
        />
        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          placeholder="••••••••••"
        />
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-blue, #0056b3)', textDecoration: 'none' }}>Olvidé mi contraseña</Link>
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}>
          Iniciar Sesión
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>¿No tienes una cuenta? </span>
        <Link to="/register" style={{ color: 'var(--primary-blue, #0056b3)', fontWeight: 600, textDecoration: 'none' }}>Registrarse</Link>
      </div>
    </div>
  );
};
export default LoginPage;
