import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

  it('muestra carrusel con dos ofertas publicadas', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/usuarios/me') return Promise.resolve({ 
        data: { id: 1, username: 'cazador', ofertas_publicadas: [
          { id: 101, titulo: 'Oferta 1', precio: 1000 },
          { id: 102, titulo: 'Oferta 2', precio: 2000 }
        ] } 
      });
      return Promise.resolve({ data: { id: 1, username: 'cazador' } });
    });

    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Oferta 1')).toBeInTheDocument());
    expect(screen.getByText('Oferta 2')).toBeInTheDocument();
  });

  it('al guardar con foto, envía FormData y cierra el modal', async () => {
    (api.get as any).mockResolvedValue({ data: { id: 1, username: 'cazador' } });
    (api.put as any).mockResolvedValue({ data: { id: 1, username: 'cazador', foto_perfil: 'new.jpg' } });

    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    await waitFor(() => fireEvent.click(screen.getByText('⚙️')));
    
    const file = new File(['(binary)'], 'foto.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText(/nombre/i).parentElement!.querySelector('input[type="file"]') || screen.getByRole('textbox', {name: /nombre/i}).parentElement!.parentElement!.querySelector('input[type="file"]')!, { target: { files: [file] } });
    
    fireEvent.click(screen.getByText('Guardar Cambios'));
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/usuarios/me', expect.any(FormData));
      expect(screen.queryByText('Editar Mi Perfil')).not.toBeInTheDocument();
    });
  });
});