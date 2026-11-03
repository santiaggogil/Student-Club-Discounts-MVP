import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { OfferCard } from '../OfferCard';

describe('OfferCard Component - Autor vs Otro Usuario e Imagen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockOffer = {
    id: 1,
    autor_id: 10,
    titulo: 'Oferta Prueba',
    descripcion: 'Descripción de prueba',
    ubicacion: 'Centro',
    precio: 5000,
    imagen: '/api/v1/uploads/test.jpeg',
    calificacion: 4.0,
    total_calificaciones: 5,
    autor_username: 'cazador'
  };

  it('muestra Editar y Eliminar si el usuario autenticado es el autor (autor_id coincide)', () => {
    localStorage.setItem('user', JSON.stringify({ id: 10, username: 'cazador' }));
    render(
      <MemoryRouter>
        <OfferCard offer={mockOffer} />
      </MemoryRouter>
    );
    const menuBtn = screen.getByRole('button', { name: /opciones de oferta/i });
    fireEvent.click(menuBtn);
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('NO muestra Editar y Eliminar si el usuario autenticado es otro usuario', () => {
    localStorage.setItem('user', JSON.stringify({ id: 99, username: 'otro' }));
    render(
      <MemoryRouter>
        <OfferCard offer={mockOffer} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: /opciones de oferta/i })).not.toBeInTheDocument();
  });

  it('renderiza la imagen exactamente con el valor de oferta.imagen sin modificar la ruta', () => {
    render(
      <MemoryRouter>
        <OfferCard offer={mockOffer} />
      </MemoryRouter>
    );
    const img = screen.getByRole('img', { name: /Oferta Prueba/i });
    expect(img).toHaveAttribute('src', '/api/v1/uploads/test.jpeg');
  });

  it('maneja el error de imagen mostrando el recuadro CSS sin bucle infinito y sin repetir petición', () => {
    render(
      <MemoryRouter>
        <OfferCard offer={mockOffer} />
      </MemoryRouter>
    );
    const img = screen.getByRole('img', { name: /Oferta Prueba/i });
    
    fireEvent.error(img);
    
    expect(screen.queryByRole('img', { name: /Oferta Prueba/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('image-error-fallback')).toBeInTheDocument();
  });
});
