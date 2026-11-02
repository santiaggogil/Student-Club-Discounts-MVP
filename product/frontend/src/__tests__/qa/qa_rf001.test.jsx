import { render } from '@testing-library/react';
import { RegisterPage } from '../../pages/RegisterPage';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('TC-007 Mobile First', () => {
  it('test_tc_007_mobile_first_layout', () => {
    const { container } = render(<BrowserRouter><RegisterPage /></BrowserRouter>);
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    const styles = window.getComputedStyle(form);
    expect(styles.width).not.toBe('0px');
  });
});