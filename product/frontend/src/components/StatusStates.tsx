import React from 'react';
import './StatusStates.css';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Cargando contenido...' }) => (
  <div className="status-container loading-state" role="status">
    <div className="spinner" aria-hidden="true"></div>
    <p className="status-message">{message}</p>
  </div>
);

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No hay elementos disponibles',
  message = 'Intenta más tarde o ajusta tus filtros de búsqueda.',
  actionText,
  onAction,
}) => (
  <div className="status-container empty-state">
    <div className="empty-icon" aria-hidden="true">
      📂
    </div>
    <h3 className="status-title">{title}</h3>
    <p className="status-message">{message}</p>
    {actionText && onAction && (
      <button className="btn-primary" onClick={onAction}>
        {actionText}
      </button>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocurrió un error al cargar',
  message = 'No pudimos conectar con el servidor o procesar la solicitud.',
  onRetry,
}) => (
  <div className="status-container error-state" role="alert">
    <div className="error-icon" aria-hidden="true">
      ⚠️
    </div>
    <h3 className="status-title">{title}</h3>
    <p className="status-message">{message}</p>
    {onRetry && (
      <button className="btn-secondary-outline" onClick={onRetry}>
        Reintentar
      </button>
    )}
  </div>
);
