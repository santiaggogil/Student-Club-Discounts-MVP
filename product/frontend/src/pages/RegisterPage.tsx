import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';

const registerSchema = z.object({
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  username: z.string().min(3, 'Mínimo 3 caracteres').optional().or(z.literal('')),
  password: z.string().min(10, 'Mínimo 10 caracteres').regex(/[A-Z]/, 'Falta mayúscula').regex(/[a-z]/, 'Falta minúscula').regex(/[0-9]/, 'Falta número'),
});

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Error al registrar');
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingState message="Creando cuenta..." />;

  return (
    <div className="auth-container">
      <h2>Crear cuenta</h2>
      {serverError && <ErrorState title="Error" message={serverError} onRetry={() => setServerError('')} />}
      <form onSubmit={handleSubmit}>
        <FormInput label="Correo" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} error={errors.email} />
        <FormInput label="Usuario" name="username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} error={errors.username} />
        <FormInput label="Contraseña" name="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} error={errors.password} />
        <button type="submit" className="btn-primary">Crear cuenta</button>
      </form>
      <Link to="/login">¿Ya tienes cuenta? Iniciar Sesión</Link>
    </div>
  );
};