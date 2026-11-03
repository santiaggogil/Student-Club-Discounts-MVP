import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { OfferCard } from '../OfferCard';
import api from '../../services/api';

vi.mock('../../services/api', () => ({ default: { delete: vi.fn(), post: vi.fn() } }));

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

  it('muestra Editar y Eliminar al abrir el menú si el usuario autenticado es el autor', () => {
    localStorage.setItem('user', JSON.stringify({ id: 10, username: 'cazador' }));
    render(<MemoryRouter><OfferCard offer={mockOffer} /></MemoryRouter>);
    const menuBtn = screen.getByRole('button', { name: /opciones/i });
    expect(menuBtn).toBeInTheDocument();
    fireEvent.click(menuBtn);
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('calificar no rompe la tarjeta', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { promedio_calificacion: 5.0, total_calificaciones: 6 } });
    render(<MemoryRouter><OfferCard offer={mockOffer} /></MemoryRouter>);
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[4]);
    await waitFor(() => expect(api.post).toHaveBeenCalled());
  });
});
