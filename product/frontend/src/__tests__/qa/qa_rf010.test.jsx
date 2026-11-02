import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, it, expect } from 'vitest';
import { RatingStars } from '../../components/RatingStars';

it('TC-032 permite calificar oferta ajena', async () => {
  const onRate = vi.fn();
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ promedio: 5.0 }) });
  render(<RatingStars ofertaId={1} initialRating={0} isOwner={false} onRate={onRate} />);
  fireEvent.click(screen.getAllByText('★')[4]);
  await waitFor(() => expect(onRate).toHaveBeenCalledWith(5.0));
});

it('TC-033 permite modificar calificación previa', async () => {
  const onRate = vi.fn();
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ promedio: 5.0 }) });
  render(<RatingStars ofertaId={1} initialRating={1} isOwner={false} onRate={onRate} />);
  fireEvent.click(screen.getAllByText('★')[4]);
  await waitFor(() => expect(onRate).toHaveBeenCalledWith(5.0));
});

it('TC-034 no permite calificar oferta propia', async () => {
  const onRate = vi.fn();
  render(<RatingStars ofertaId={1} initialRating={0} isOwner={true} onRate={onRate} />);
  fireEvent.click(screen.getAllByText('★')[4]);
  expect(onRate).not.toHaveBeenCalled();
});

it('TC-035 solicita iniciar sesión si no está autenticado', async () => {
  const onRate = vi.fn();
  global.fetch = vi.fn().mockRejectedValue({ response: { status: 401 } });
  window.alert = vi.fn();
  render(<RatingStars ofertaId={1} initialRating={0} isOwner={false} onRate={onRate} />);
  fireEvent.click(screen.getAllByText('★')[2]);
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Debes iniciar sesión para calificar'));
});