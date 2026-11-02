import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapPage } from '../MapPage';
import api from '../../services/api';
vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn(),
    },
}));
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => _jsx("div", { "data-testid": "map-container", children: children }),
    TileLayer: () => _jsx("div", { "data-testid": "tile-layer" }),
    Marker: ({ children }) => _jsx("div", { "data-testid": "marker", children: children }),
    Popup: ({ children }) => _jsx("div", { "data-testid": "popup", children: children }),
}));
describe('MapPage Component (HU-20)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('muestra estado vacío con el mensaje requerido cuando no hay ofertas', async () => {
        api.get.mockResolvedValueOnce({ data: [] });
        render(_jsx(MapPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Aún no hay ofertas de supermercados')).toBeInTheDocument();
        });
    });
    it('renderiza el mapa y los marcadores cuando la API retorna sedes con ofertas', async () => {
        const mockSedes = [
            {
                cadena: 'Éxito',
                nombre: 'Éxito Cable Plaza',
                latitud: 5.0568,
                longitud: -75.4871,
                ofertas: [
                    {
                        producto: 'Arroz 1kg',
                        precio: 3500.0,
                        vigencia: '2025-01-01T00:00:00',
                    },
                ],
            },
        ];
        api.get.mockResolvedValueOnce({ data: mockSedes });
        render(_jsx(MapPage, {}));
        await waitFor(() => {
            expect(screen.getByTestId('map-container')).toBeInTheDocument();
            expect(screen.getByTestId('marker')).toBeInTheDocument();
        });
    });
    it('maneja errores de la API mostrando ErrorState', async () => {
        api.get.mockRejectedValueOnce({ response: { status: 500, data: { detail: 'Error del servidor' } } });
        render(_jsx(MapPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Error al cargar el mapa')).toBeInTheDocument();
            expect(screen.getByText('Error del servidor')).toBeInTheDocument();
        });
    });
});
