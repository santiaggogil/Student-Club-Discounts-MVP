import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza correctamente el formulario de inicio de sesión', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Student Club Discounts')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /correo electrónico/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra errores de validación si los campos están vacíos al enviar', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('El correo o usuario es obligatorio')).toBeInTheDocument();
    expect(await screen.findByText('La contraseña es obligatoria')).toBeInTheDocument();
  });

  it('maneja exitosamente el inicio de sesión y guarda el token', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { access_token: 'fake-jwt-token', token_type: 'bearer' },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByRole('textbox', { name: /correo electrónico/i }), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    });
  });

  it('muestra mensaje genérico de error ante credenciales incorrectas (401)', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Unauthorized' } },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByRole('textbox', { name: /correo electrónico/i }), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'WrongPass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText('Credenciales incorrectas')).toBeInTheDocument();
  });
});
