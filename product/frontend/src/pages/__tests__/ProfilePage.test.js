import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from '../ProfilePage';
import api from '../../services/api';
vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
    },
}));
describe('ProfilePage Component (HU-03)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renderiza correctamente el perfil del usuario autenticado y su formulario de edición', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                id: 1,
                username: 'cazador',
                nombre: 'Cazador Experto',
                biografia: 'Amante de los descuentos',
                seguidores_privados: false,
                ofertas: [
                    { id: 10, titulo: 'Oferta 1', precio: 5000, ubicacion: 'Centro', descripcion: 'Desc', calificacion: 4.0, total_calificaciones: 2, es_propia: true }
                ]
            }
        });
        render(_jsx(MemoryRouter, { initialEntries: ['/perfil'], children: _jsx(Routes, { children: _jsx(Route, { path: "/perfil", element: _jsx(ProfilePage, {}) }) }) }));
        await waitFor(() => {
            expect(screen.getByText('Cazador Experto')).toBeInTheDocument();
            expect(screen.getByText('Amante de los descuentos')).toBeInTheDocument();
            expect(screen.getByText('Editar Mi Perfil')).toBeInTheDocument();
            expect(screen.getByText('Oferta 1')).toBeInTheDocument();
        });
    });
    it('renderiza perfil público correctamente sin formulario de edición', async () => {
        api.get.mockResolvedValueOnce({
            data: {
                id: 2,
                username: 'otro_usuario',
                nombre: 'Otro Usuario',
                biografia: 'Biografía pública',
                seguidores_privados: true,
                ofertas: []
            }
        });
        render(_jsx(MemoryRouter, { initialEntries: ['/perfil/2'], children: _jsx(Routes, { children: _jsx(Route, { path: "/perfil/:id", element: _jsx(ProfilePage, {}) }) }) }));
        await waitFor(() => {
            expect(screen.getByText('Otro Usuario')).toBeInTheDocument();
            expect(screen.getByText('Biografía pública')).toBeInTheDocument();
            expect(screen.queryByText('Editar Mi Perfil')).not.toBeInTheDocument();
            expect(screen.getByText('Este usuario aún no ha publicado ofertas comunitarias.')).toBeInTheDocument();
        });
    });
});
