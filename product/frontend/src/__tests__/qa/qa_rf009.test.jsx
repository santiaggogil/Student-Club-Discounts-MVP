import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedPage } from '../../pages/FeedPage';
import api from '../../services/api';

vi.mock('../../services/api', () => ({ default: { get: vi.fn() } }));

describe('QA RF-009 Frontend', () => {
  it('TC-024 muestra detalles de oferta', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, titulo: 'Test', descripcion: 'D', ubicacion: 'U', autor_id: 1 }] });
    render(<FeedPage />);
    expect(await screen.findByText('Test')).toBeInTheDocument();
  });

  it('TC-026 muestra estado vacío', async () => {
    api.get.mockResolvedValue({ data: [] });
    render(<FeedPage />);
    expect(await screen.findByText(/No hay ofertas/i)).toBeInTheDocument();
  });
});