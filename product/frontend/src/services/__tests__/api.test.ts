import { describe, it, expect, beforeEach } from 'vitest';
import api from '../api';

describe('Cliente API HTTP', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('configura el baseURL en /api/v1', () => {
    expect(api.defaults.baseURL).toBe('/api/v1');
  });

  it('inyecta la cabecera Authorization cuando existe un token en localStorage', async () => {
    localStorage.setItem('token', 'jwt-token-de-prueba');
    const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = await requestHandler({ headers: {} });
    expect(config.headers?.Authorization).toBe('Bearer jwt-token-de-prueba');
  });
});
