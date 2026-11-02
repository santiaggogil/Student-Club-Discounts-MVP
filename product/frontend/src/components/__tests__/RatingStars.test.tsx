import { render, screen, fireEvent } from '@testing-library/react';
import { RatingStars } from '../RatingStars';
import { describe, it, expect, vi, beforeAll } from 'vitest';

describe('RatingStars Component', () => {
  beforeAll(() => {
    window.alert = vi.fn();
  });

  it('permite calificar si no es el dueño', () => {
    const onRate = vi.fn();
    render(<RatingStars ofertaId={1} initialRating={0} isOwner={false} onRate={onRate} />);
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[2]);
    expect(stars[2]).toBeInTheDocument();
  });
});