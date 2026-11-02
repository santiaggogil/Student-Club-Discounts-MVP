import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadingState, EmptyState, ErrorState } from '../StatusStates';
describe('Componentes de Estado (StatusStates)', () => {
    it('renderiza LoadingState con mensaje personalizado', () => {
        render(_jsx(LoadingState, { message: "Cargando ofertas..." }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Cargando ofertas...')).toBeInTheDocument();
    });
    it('renderiza EmptyState con título, mensaje y botón de acción', () => {
        const handleAction = vi.fn();
        render(_jsx(EmptyState, { title: "No hay ofertas", message: "Prueba m\u00E1s tarde", actionText: "Publicar oferta", onAction: handleAction }));
        expect(screen.getByText('No hay ofertas')).toBeInTheDocument();
        expect(screen.getByText('Prueba más tarde')).toBeInTheDocument();
        const btn = screen.getByRole('button', { name: /publicar oferta/i });
        fireEvent.click(btn);
        expect(handleAction).toHaveBeenCalledTimes(1);
    });
    it('renderiza ErrorState y permite reintentar', () => {
        const handleRetry = vi.fn();
        render(_jsx(ErrorState, { title: "Error de red", message: "Sin conexi\u00F3n", onRetry: handleRetry }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Error de red')).toBeInTheDocument();
        expect(screen.getByText('Sin conexión')).toBeInTheDocument();
        const retryBtn = screen.getByRole('button', { name: /reintentar/i });
        fireEvent.click(retryBtn);
        expect(handleRetry).toHaveBeenCalledTimes(1);
    });
});
