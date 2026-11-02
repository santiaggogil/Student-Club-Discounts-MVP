import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';

const offerSchema = z.object({
  titulo: z.string().min(3, 'Título requerido'),
  precio: z.string().min(1, 'Precio requerido'),
  ubicacion: z.string().min(3, 'Ubicación requerida'),
  vigencia: z.string().min(1, 'Vigencia requerida'),
  descripcion: z.string().min(10, 'Descripción muy corta'),
  foto: z.instanceof(File).refine(f => ['image/jpeg', 'image/png'].includes(f.type), 'Formato no permitido')
});

export const PublishOfferPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ titulo: '', precio: '', ubicacion: '', vigencia: '', descripcion: '', foto: null as File | null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFormData(prev => ({ ...prev, foto: e.target.files![0] }));
  };

  const handleSubmit = async () => {
    const result = offerSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v as any));
    try {
      await api.post('/ofertas', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/');
    } catch (e: any) { 
      setErrors({ server: e.response?.data?.detail || 'Error al publicar' }); 
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingState message="Publicando..." />;

  return (
    <div className="publish-container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Paso {step} de 3</h2>
      {errors.server && <ErrorState title="Error" message={errors.server} />}
      {step === 1 && (
        <div className="form-group">
          <label htmlFor="foto">Foto</label>
          <input id="foto" type="file" onChange={handleFile} />
          {errors.foto && <span className="form-error">{errors.foto}</span>}
        </div>
      )}
      {step === 2 && (
        <>
          <FormInput label="Título" name="titulo" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} error={errors.titulo} />
          <FormInput label="Precio" name="precio" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} error={errors.precio} />
          <FormInput label="Ubicación" name="ubicacion" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} error={errors.ubicacion} />
          <FormInput label="Vigencia" name="vigencia" value={formData.vigencia} onChange={e => setFormData({...formData, vigencia: e.target.value})} error={errors.vigencia} />
        </>
      )}
      {step === 3 && (
        <FormInput label="Descripción" name="descripcion" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} error={errors.descripcion} />
      )}
      <div style={{ marginTop: '1rem' }}>
        {step > 1 && <button onClick={() => setStep(step - 1)}>Atrás</button>}
        {step < 3 ? <button onClick={() => setStep(step + 1)}>Siguiente</button> : <button onClick={handleSubmit}>Publicar</button>}
      </div>
    </div>
  );
};