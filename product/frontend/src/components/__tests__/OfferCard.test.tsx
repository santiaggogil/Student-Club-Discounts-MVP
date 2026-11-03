import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { OfferCard } from '../OfferCard';
import api from '../../services/api';

vi.mock('../../services/api', () => ({ default: { delete: vi.fn() } }));

describe('OfferCard Component - Autor vs Otro Usuario e Imagen', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const mockOffer = {
    id: 1,
    autor_id: 10,
    titulo: 'Oferta Prueba',
    descripcion: 'Descripción de prueba',
    ubicacion: 'Centro',
    precio: 5000,
    imagen: '/api/v1/uploads/test.jpeg',
    calificacion: 4.0,
    total_calificaciones: 5,
    autor_username: 'cazador'
  };

  it('muestra Editar y Eliminar si el usuario autenticado es el autor', () => {
    localStorage.setItem('user', JSON.stringify({ id: 10, username: 'cazador' }));
    render(<MemoryRouter><OfferCard offer={mockOffer} /></MemoryRouter>);
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('Eliminar abre el modal y confirma', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 10, username: 'cazador' }));
    (api.delete as any).mockResolvedValueOnce({});
    render(<MemoryRouter><OfferCard offer={mockOffer} /></MemoryRouter>);
    fireEvent.click(screen.getByText('Eliminar'));
    expect(screen.getByText(/¿Seguro que quieres eliminar/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Eliminar'));
    await waitFor(() => expect(api.delete).toHaveBeenCalled());
  });
});
