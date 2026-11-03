import { jsx as _jsx } from "react/jsx-runtime";
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
    it('renderiza correctamente el perfil del usuario autenticado y su formulario de edición', async () => {
        api.get.mockImplementation((url) => {
            if (url === '/usuarios/me') return Promise.resolve({ data: { id: 1, username: 'cazador' } });
            return Promise.resolve({ data: { id: 1, username: 'cazador', nombre: 'Cazador Experto', biografia: 'Amante de los descuentos', seguidores_privados: false, ofertas: [] } });
        });
        render(_jsx(MemoryRouter, { initialEntries: ['/perfil'], children: _jsx(Routes, { children: _jsx(Route, { path: "/perfil", element: _jsx(ProfilePage, {}) }) }) }));
        await waitFor(() => {
            expect(screen.getByText('Cazador Experto')).toBeInTheDocument();
            expect(screen.getByText('Editar Mi Perfil')).toBeInTheDocument();
        });
    });
    it('muestra botón de seguir en perfil público ajeno', async () => {
        api.get.mockImplementation((url) => {
            if (url === '/usuarios/me') return Promise.resolve({ data: { id: 1, username: 'cazador' } });
            return Promise.resolve({ data: { id: 2, username: 'otro', seguidores_count: 0, lo_sigo: false } });
        });
        api.post.mockResolvedValueOnce({ data: {} });
        render(_jsx(MemoryRouter, { initialEntries: ['/perfil/2'], children: _jsx(Routes, { children: _jsx(Route, { path: "/perfil/:id", element: _jsx(ProfilePage, {}) }) }) }));
        await waitFor(() => {
            expect(screen.getByText('Seguir')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Seguir'));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/usuarios/2/seguir'));
    });
});