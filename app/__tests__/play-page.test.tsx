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

  it('keeps future game ideas separate from the playable campaign', () => {
    render(<PlayPage />);

    expect(screen.getByText(/More games, including/i)).toHaveTextContent(
      'Guess the Crop and Farm Memory',
    );
  });
});
