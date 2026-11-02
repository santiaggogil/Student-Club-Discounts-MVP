import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OfferCard } from '../OfferCard';

describe('OfferCard Component - Image Error Handling', () => {
  const mockOffer = {
    id: 1,
    titulo: 'Oferta Prueba',
    descripcion: 'Descripción de prueba',
    ubicacion: 'Centro',
    precio: 5000,
    foto: '/uploads/test.jpg',
    calificacion: 4.0,
    total_calificaciones: 5,
    es_propia: false,
    autor_username: 'cazador'
  };

  it('renderiza la imagen correctamente con la ruta ajustada', () => {
    render(<OfferCard offer={mockOffer} />);
    const img = screen.getByRole('img', { name: /Oferta Prueba/i });
    expect(img).toHaveAttribute('src', '/api/v1/uploads/test.jpg');
  });

  it('maneja el error de imagen mostrando el recuadro CSS sin bucle infinito', () => {
    render(<OfferCard offer={mockOffer} />);
    const img = screen.getByRole('img', { name: /Oferta Prueba/i });
    
    // Disparar error de carga
    fireEvent.error(img);
    
    // Verificar que la imagen desaparece y aparece el recuadro fallback
    expect(screen.queryByRole('img', { name: /Oferta Prueba/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('image-error-fallback')).toBeInTheDocument();
  });
});
