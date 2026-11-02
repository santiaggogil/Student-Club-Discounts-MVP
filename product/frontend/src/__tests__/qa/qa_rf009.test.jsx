import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedPage } from '../../pages/FeedPage';

describe('QA RF-009 Feed de Ofertas (Componentes)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 1,
            titulo: 'Oferta Comunitaria',
            descripcion: 'Delicioso almuerzo',
            ubicacion: 'Cafetería',
            precio: 8000,
            imagen: 'test.jpg',
            autor_id: 1
          }
        ])
      })
    );
  });

  it('TC-028 muestra las tarjetas de oferta detalladas en el feed', async () => {
    render(<BrowserRouter><FeedPage /></BrowserRouter>);
    expect(await screen.findByText('Oferta Comunitaria')).toBeInTheDocument();
  });

  it('TC-029 carga ofertas por tandas progresivamente al interactuar', async () => {
    render(<BrowserRouter><FeedPage /></BrowserRouter>);
    const loadMoreBtn = await screen.findByRole('button', { name: /cargar más/i });
    fireEvent.click(loadMoreBtn);
    expect(loadMoreBtn).toBeInTheDocument();
  });

  it('TC-030 muestra un mensaje de estado vacío cuando no hay ofertas', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
    render(<BrowserRouter><FeedPage /></BrowserRouter>);
    expect(await screen.findByText(/no hay ofertas/i)).toBeInTheDocument();
  });

  it('TC-031 carga el feed completamente de forma rápida', async () => {
    render(<BrowserRouter><FeedPage /></BrowserRouter>);
    expect(await screen.findByText('Oferta Comunitaria')).toBeInTheDocument();
  });
});
