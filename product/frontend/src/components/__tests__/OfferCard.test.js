import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { OfferCard } from '../OfferCard';
describe('OfferCard Component - Image Error Handling', () => {
    const mockOffer = {
        id: 1,
        titulo: 'Oferta Prueba',
        descripcion: 'Descripción de prueba',
        ubicacion: 'Centro',
        precio: 5000,
        imagen: '/api/v1/uploads/test.jpeg',
        calificacion: 4.0,
        total_calificaciones: 5,
        es_propia: false,
        autor_username: 'cazador'
    };
    it('renderiza la imagen exactamente con el valor de oferta.imagen sin modificar la ruta', () => {
        render(_jsx(MemoryRouter, { children: _jsx(OfferCard, { offer: mockOffer }) }));
        const img = screen.getByRole('img', { name: /Oferta Prueba/i });
        expect(img).toHaveAttribute('src', '/api/v1/uploads/test.jpeg');
    });
    it('maneja el error de imagen mostrando el recuadro CSS sin bucle infinito y sin repetir petición', () => {
        render(_jsx(MemoryRouter, { children: _jsx(OfferCard, { offer: mockOffer }) }));
        const img = screen.getByRole('img', { name: /Oferta Prueba/i });
        fireEvent.error(img);
        expect(screen.queryByRole('img', { name: /Oferta Prueba/i })).not.toBeInTheDocument();
        expect(screen.getByTestId('image-error-fallback')).toBeInTheDocument();
    });
});