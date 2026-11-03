import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { LoadingState, ErrorState } from '../components/StatusStates';

const getMinDate = () => new Date().toISOString().slice(0, 16);

const publishSchema = z.object({
  titulo: z.string().min(3, 'Título requerido'),
  precio: z.string().min(1, 'Precio requerido'),
  ubicacion: z.string().min(3, 'Ubicación requerida'),
  vigencia: z.string().min(1, 'Vigencia requerida').refine(val => new Date(val) > new Date(), 'La fecha no puede ser pasada'),
  descripcion: z.string().min(10, 'Descripción muy corta'),
  foto: z.instanceof(File).refine(f => ['image/jpeg', 'image/png'].includes(f.type), 'Formato no permitido')
});

const editSchema = z.object({
  titulo: z.string().min(3, 'Título requerido'),
  precio: z.string().min(1, 'Precio requerido'),
  ubicacion: z.string().min(3, 'Ubicación requerida'),
  vigencia: z.string().min(1, 'Vigencia requerida').refine(val => new Date(val) > new Date(), 'La fecha no puede ser pasada'),
  descripcion: z.string().min(10, 'Descripción muy corta'),
  foto: z.instanceof(File).optional().nullable().refine(f => !f || ['image/jpeg', 'image/png'].includes(f.type), 'Formato no permitido')
});

export const PublishOfferPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ titulo: '', precio: '', ubicacion: '', vigencia: '', descripcion: '', foto: null as File | null });
  const [initialData, setInitialData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setFetching(true);
      api.get(`/ofertas/${id}`)
        .then(res => {
          const data = res.data;
          setInitialData(data);
          setFormData({
            titulo: data.titulo || '',
            precio: data.precio !== undefined ? String(data.precio) : '',
            ubicacion: data.ubicacion || '',
            vigencia: data.vigencia ? new Date(data.vigencia).toISOString().slice(0, 16) : '',
            descripcion: data.descripcion || '',
            foto: null
          });
        })
        .catch(err => {
          const detail = err.response?.data?.detail || err.response?.data?.message || 'Error al cargar la oferta';
          setServerError(typeof detail === 'string' ? detail : JSON.stringify(detail));
        })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFormData(prev => ({ ...prev, foto: e.target.files![0] }));
  };

  const handleSubmit = async () => {
    setServerError('');
    const schema = isEditMode ? editSchema : publishSchema;
    const result = schema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('precio', formData.precio);
    data.append('ubicacion', formData.ubicacion);
    data.append('vigencia', new Date(formData.vigencia).toISOString());
    data.append('descripcion', formData.descripcion);
    if (formData.foto) {
      data.append('foto', formData.foto);
    }

    try {
      if (isEditMode) {
        await api.put(`/ofertas/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/ofertas', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/');
    } catch (e: any) {
      const detail = e.response?.data?.detail || e.response?.data?.message || 'Error al guardar la oferta';
      setServerError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingState message="Cargando oferta..." />;
  if (loading) return <LoadingState message={isEditMode ? "Guardando oferta..." : "Publicando oferta..."} />;

  return (
    <div className="publish-container" style={{ maxWidth: '600px', margin: '2rem auto', background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color, #e0e0e0)' }}>
      <h2 style={{ marginBottom: '1rem' }}>
        {isEditMode ? `Editar Oferta - Paso ${step} de 3` : `Publicar Nuevo Hallazgo - Paso ${step} de 3`}
      </h2>
      {serverError && <ErrorState title="Error del servidor" message={serverError} onRetry={() => setServerError('')} />}
      
      {step === 1 && (
        <div className="form-group">
          <label htmlFor="foto" className="form-label">Foto de la oferta {isEditMode && '(opcional)'}</label>
          {isEditMode && initialData?.imagen && (
            <div style={{ marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>Imagen actual:</p>
              <img src={initialData.imagen} alt="Vista previa" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
            </div>
          )}
          <input id="foto" type="file" onChange={handleFile} className="form-control" accept="image/jpeg,image/png" />
          {errors.foto && <span className="form-error" role="alert">{errors.foto}</span>}
        </div>
      )}

      {step === 2 && (
        <>
          <FormInput label="Título" name="titulo" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} error={errors.titulo} placeholder="Ej. Empanada Mixta x1" />
          <FormInput label="Precio" name="precio" type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} error={errors.precio} placeholder="Ej. 3000" />
          <FormInput label="Ubicación" name="ubicacion" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} error={errors.ubicacion} placeholder="Ej. Centro, Universidades" />
          <div className="form-group">
            <label htmlFor="vigencia" className="form-label">Vigencia</label>
            <input id="vigencia" type="datetime-local" min={getMinDate()} value={formData.vigencia} onChange={e => setFormData({...formData, vigencia: e.target.value})} className={`form-control ${errors.vigencia ? 'is-invalid' : ''}`} />
            {errors.vigencia && <span className="form-error" role="alert">{errors.vigencia}</span>}
          </div>
        </>
      )}

      {step === 3 && (
        <div className="form-group">
          <label htmlFor="descripcion" className="form-label">Descripción de la oferta</label>
          <textarea id="descripcion" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="form-control" rows={4} placeholder="Una de las mejores empanadas..." />
          {errors.descripcion && <span className="form-error" role="alert">{errors.descripcion}</span>}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        {step > 1 ? <button onClick={() => setStep(step - 1)} className="btn-secondary-outline">Atrás</button> : <div />}
        {step < 3 ? <button onClick={() => setStep(step + 1)} className="btn-primary">Siguiente</button> : <button onClick={handleSubmit} className="btn-primary">{isEditMode ? 'Guardar Cambios' : 'Publicar Oferta'}</button>}
      </div>
    </div>
  );
};
export default PublishOfferPage;