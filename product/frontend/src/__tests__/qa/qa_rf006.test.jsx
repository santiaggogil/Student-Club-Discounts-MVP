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
});
