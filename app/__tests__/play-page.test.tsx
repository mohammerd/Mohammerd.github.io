import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PlayPage from '../play/page';

describe('play page', () => {
  it('publishes Harvest Rush as the first playable game', () => {
    render(<PlayPage />);

    expect(screen.getByRole('heading', { name: 'Play' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Every decision has a cost.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Open field plan/ }),
    ).toBeEnabled();
  });

  it('labels future games as in development rather than playable', () => {
    render(<PlayPage />);

    expect(
      screen.getByRole('heading', { name: 'Guess the Crop' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Farm Memory' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/IN DEVELOPMENT/)).toHaveLength(2);
  });
});
