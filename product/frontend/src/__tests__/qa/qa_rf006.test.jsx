import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PublishOfferPage } from '../../pages/PublishOfferPage';
import api from '../../services/api';

vi.mock('../../services/api', () => ({ default: { post: vi.fn() } }));

describe('QA RF-006', () => {
  it('TC-021 muestra error al subir formato inválido', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 422, data: { detail: 'Formato no permitido' } } });
    render(<MemoryRouter><PublishOfferPage /></MemoryRouter>);
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/foto/i);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText(/Siguiente/i));
    await waitFor(() => expect(screen.getByText(/Formato no permitido/i)).toBeInTheDocument());
  });

  it('TC-027 realiza petición POST al publicar oferta', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } });
    render(<MemoryRouter><PublishOfferPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/foto/i), { target: { files: [new File(['data'], 'test.jpg', { type: 'image/jpeg' })] } });
    fireEvent.click(screen.getByText(/Siguiente/i));
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/ubicación/i), { target: { value: 'Manizales' } });
    fireEvent.click(screen.getByText(/Siguiente/i));
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Oferta' } });
    fireEvent.click(screen.getByText(/Publicar/i));
    await waitFor(() => expect(api.post).toHaveBeenCalled());
  });
});