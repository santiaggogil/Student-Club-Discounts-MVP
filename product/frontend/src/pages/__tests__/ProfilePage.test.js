import { jsx as _jsx } from "react/jsx-runtime";
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
        api.get.mockImplementation((url) => {
            if (url === '/usuarios/me')
                return Promise.resolve({
                    data: { id: 1, username: 'cazador', ofertas_publicadas: [
                            { id: 101, titulo: 'Oferta 1', precio: 1000 },
                            { id: 102, titulo: 'Oferta 2', precio: 2000 }
                        ] }
                });
            return Promise.resolve({ data: { id: 1, username: 'cazador' } });
        });
        render(_jsx(MemoryRouter, { children: _jsx(ProfilePage, {}) }));
        await waitFor(() => expect(screen.getByText('Oferta 1')).toBeInTheDocument());
        expect(screen.getByText('Oferta 2')).toBeInTheDocument();
    });
    it('al guardar con foto, envía FormData con multipart/form-data y el archivo, y actualiza el avatar', async () => {
        api.get.mockResolvedValue({ data: { id: 1, username: 'cazador', foto_perfil: 'old.jpg' } });
        api.put.mockResolvedValue({ data: { id: 1, username: 'cazador', foto_perfil: 'new.jpg' } });
        render(_jsx(MemoryRouter, { children: _jsx(ProfilePage, {}) }));
        await waitFor(() => fireEvent.click(screen.getByText('⚙️')));
        const file = new File(['(binary)'], 'foto.jpg', { type: 'image/jpeg' });
        const fileInput = document.querySelector('input[type="file"]');
        fireEvent.change(fileInput, { target: { files: [file] } });
        fireEvent.click(screen.getByText('Guardar Cambios'));
        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith('/usuarios/me', expect.any(FormData), expect.objectContaining({
                headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' })
            }));
            const formDataArg = api.put.mock.calls[0][1];
            expect(formDataArg.get('foto')).toBe(file);
            expect(screen.queryByText('Editar Mi Perfil')).not.toBeInTheDocument();
        });
    });
});
