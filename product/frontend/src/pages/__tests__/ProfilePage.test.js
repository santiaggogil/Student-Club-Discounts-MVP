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
        post: vi.fn(),
        delete: vi.fn(),
    },
}));
describe('ProfilePage Component (HU-03 & Seguir)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ id: 1, username: 'cazador' }));
    });
    it('en perfil ajeno aparece botón Seguir y no aparece la ruedita ⚙️', async () => {
        api.get.mockResolvedValueOnce({
            data: { id: 2, username: 'otro', lo_sigo: false, seguidores_count: 5, ofertas: [] }
        });
        render(_jsx(MemoryRouter, { initialEntries: ['/perfil/2'], children: _jsx(Routes, { children: _jsx(Route, { path: "/perfil/:id", element: _jsx(ProfilePage, {}) }) }) }));
        await waitFor(() => {
            expect(screen.getByText('Seguir')).toBeInTheDocument();
            expect(screen.queryByText('⚙️')).not.toBeInTheDocument();
        });
    });
    it('en perfil propio aparece la ruedita ⚙️ y no aparece el botón Seguir', async () => {
        api.get.mockResolvedValueOnce({
            data: { id: 1, username: 'cazador', lo_sigo: false, seguidores_count: 10, ofertas: [] }
        });
        render(_jsx(MemoryRouter, { initialEntries: ['/perfil/1'], children: _jsx(Routes, { children: _jsx(Route, { path: "/perfil/:id", element: _jsx(ProfilePage, {}) }) }) }));
        await waitFor(() => {
            expect(screen.getByText('⚙️')).toBeInTheDocument();
            expect(screen.queryByText('Seguir')).not.toBeInTheDocument();
        });
    });
});
