import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from '../ProfilePage';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProfilePage Component (HU-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  it('al hacer clic en Seguidores abre el modal y llama al servicio', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/usuarios/me') return Promise.resolve({ data: { id: 1, username: 'cazador' } });
      if (url.includes('/seguidores')) return Promise.resolve({ data: [{ id: 2, username: 'seguidor1' }] });
      return Promise.resolve({ data: { id: 1, username: 'cazador', seguidores_count: 1 } });
    });

    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes>
          <Route path="/perfil" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Seguidores: 1/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Seguidores: 1/i));
    
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/usuarios/1/seguidores'));
    expect(screen.getByText('seguidor1')).toBeInTheDocument();
  });

  it('abre el modal de edición al hacer clic en el engranaje', async () => {
    (api.get as any).mockResolvedValue({ data: { id: 1, username: 'cazador' } });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('⚙️')).toBeInTheDocument());
    fireEvent.click(screen.getByText('⚙️'));
    expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
  });
});