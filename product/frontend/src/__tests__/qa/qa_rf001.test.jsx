import { render } from '@testing-library/react';
import { RegisterPage } from '../../pages/RegisterPage';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('TC-007 Mobile First', () => {
  it('test_tc_007_mobile_first_layout', () => {
    window.innerWidth = 375;
    window.innerHeight = 667;
    window.dispatchEvent(new Event('resize'));
    const { container } = render(<BrowserRouter><RegisterPage /></BrowserRouter>);
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    const styles = window.getComputedStyle(container.firstChild);
    expect(styles.maxWidth).toBeTruthy();
  });
});
