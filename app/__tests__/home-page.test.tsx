import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '../page';

describe('homepage', () => {
  it('introduces Muhammad and shows the three current projects', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'Muhammad Zakari' }),
    ).toBeInTheDocument();

    for (const name of ['AgroGuardAI', 'Hypervisor-Zero', 'AgroMind']) {
      expect(
        screen.getByRole('link', { name: `Read more about ${name}` }),
      ).toBeInTheDocument();
    }
  });

  it('offers a link to the full project register', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('link', { name: /All projects/ }),
    ).toHaveAttribute('href', '/projects/');
  });
});
