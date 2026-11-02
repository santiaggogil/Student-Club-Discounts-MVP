import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { PublishOfferPage } from '../../pages/PublishOfferPage';

describe('QA RF-002', () => {
  it('TC-013 redirige al login si no hay sesión', () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={['/publicar']}>
        <Routes>
          <Route path="/publicar" element={<PublishOfferPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
