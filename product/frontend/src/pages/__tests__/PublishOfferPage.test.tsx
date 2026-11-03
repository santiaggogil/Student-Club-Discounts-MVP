import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PublishOfferPage } from '../PublishOfferPage';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('PublishOfferPage Component - Modo Edición', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('en modo edición precarga datos y al guardar llama a PUT con el id y NUNCA a POST', async () => {
    const mockOffer = {
      id: 5,
      titulo: 'Oferta Original',
      precio: 4000,
      ubicacion: 'Campus',
      vigencia: new Date(Date.now() + 86400000).toISOString(),
      descripcion: 'Descripción original larga para pasar validación'
    };

    (api.get as any).mockResolvedValueOnce({ data: mockOffer });
    (api.put as any).mockResolvedValueOnce({ data: { ...mockOffer, titulo: 'Oferta Modificada' } });

    render(
      <MemoryRouter initialEntries={['/ofertas/5/editar']}>
        <Routes>
          <Route path="/ofertas/:id/editar" element={<PublishOfferPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/ofertas/5');
    });

    fireEvent.click(screen.getByText('Siguiente'));

    const tituloInput = screen.getByLabelText(/título/i);
    fireEvent.change(tituloInput, { target: { value: 'Oferta Modificada' } });
    fireEvent.click(screen.getByText('Siguiente'));

    const submitBtn = screen.getByText('Guardar Cambios');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/ofertas/5', expect.any(FormData), expect.any(Object));
      expect(api.post).not.toHaveBeenCalled();
    });
  });
});
