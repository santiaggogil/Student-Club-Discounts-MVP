import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../../pages/LoginPage';
import { PublishOfferPage } from '../../pages/PublishOfferPage';
import { describe, it, expect } from 'vitest';

describe('QA RF-002 Frontend', () => {
  it('test_tc_013_redireccion_login', () => {
    localStorage.removeItem('token');
    render(
      <MemoryRouter initialEntries={['/publicar']}>
        <Routes>
          <Route path="/publicar" element={<PublishOfferPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
  });
});