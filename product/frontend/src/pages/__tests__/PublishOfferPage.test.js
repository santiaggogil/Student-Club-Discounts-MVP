import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PublishOfferPage } from '../PublishOfferPage';
import api from '../../services/api';
vi.mock('../../services/api', () => {
    {
        {
            get: vi.fn(),
                post;
            vi.fn(),
                put;
            vi.fn(),
            ;
        }
    }
});
describe('PublishOfferPage Component - Modo Edición', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('en modo edición precarga datos y al guardar llama a PUT incluyendo los cinco campos obligatorios', async () => {
        const mockOffer = {
            id: 5,
            titulo: 'Oferta Original',
            precio: 4000,
            ubicacion: 'Campus',
            vigencia: new Date(Date.now() + 86400000).toISOString(),
            descripcion: 'Descripción original larga para pasar validación'
        };
        api.get.mockResolvedValueOnce({ data: mockOffer });
        api.put.mockResolvedValueOnce({ data: { ...mockOffer, titulo: 'Oferta Modificada' } });
        render(_jsx(MemoryRouter, { initialEntries: ['/ofertas/5/editar'], children: _jsx(Routes, { children: _jsx(Route, { path: "/ofertas/:id/editar", element: _jsx(PublishOfferPage, {}) }) }) }));
        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/ofertas/5');
        });
        fireEvent.click(screen.getByText('Siguiente'));
        const tituloInput = screen.getByLabelText(/título/i);
        fireEvent.change(tituloInput, { target: { value: 'Oferta Modificada' } });
        fireEvent.click(screen.getByText('Siguiente'));
        const submitBtn = screen.getByText('Guardar Cambios');
        fireEvent.click(submitBtn);
        await waitFor(() => {
            expect(api.put).toHaveBeenCalled();
            const callArgs = api.put.mock.calls[0];
            expect(callArgs[0]).toBe('/ofertas/5');
            const formData = callArgs[1];
            expect(formData.get('titulo')).toBe('Oferta Modificada');
            expect(formData.get('precio')).toBe('4000');
            expect(formData.get('ubicacion')).toBe('Campus');
            expect(formData.get('vigencia')).toBeTruthy();
            expect(formData.get('descripcion')).toBe('Descripción original larga para pasar validación');
            expect(api.post).not.toHaveBeenCalled();
        });
    });
});
