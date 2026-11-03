import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { FeedPage } from '../FeedPage';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('FeedPage Component (HU-12-FE)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el selector de orden y realiza la llamada con orden=relevancia por defecto', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          titulo: 'Oferta 1',
          descripcion: 'Desc 1',
          ubicacion: 'Centro',
          precio: 5000,
          calificacion: 4.5,
          total_calificaciones: 10,
          es_propia: false,
          autor_username: 'cazador'
        }
      ]
    });

    render(<MemoryRouter><FeedPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Más relevantes')).toBeInTheDocument();
      expect(screen.getByText('Más recientes')).toBeInTheDocument();
      expect(api.get).toHaveBeenCalledWith('/ofertas?page=1&size=10&orden=relevancia');
    });
  });

  it('cambia el orden a recientes y llama a la API con orden=recientes reiniciando paginación', async () => {
    (api.get as any).mockResolvedValue({
      data: []
    });

    render(<MemoryRouter><FeedPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Más recientes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Más recientes'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/ofertas?page=1&size=10&orden=recientes');
    });
  });
});