import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Layout } from '../Layout';

describe('Layout Component', () => {
  it('renderiza la marca SCD y la navegación principal', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Contenido principal</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText('Student Club Discounts')).toBeInTheDocument();
    expect(screen.getByText('Comunidad')).toBeInTheDocument();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    expect(screen.getByText('Contenido principal')).toBeInTheDocument();
  });
});
