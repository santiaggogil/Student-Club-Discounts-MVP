import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
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
});
