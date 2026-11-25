import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PlayPage from '../play/page';

describe('play page', () => {
  it('shows both playable games in the selection grid', () => {
    render(<PlayPage />);

    expect(screen.getByRole('heading', { name: 'Play' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Choose a game.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Play Harvest Rush' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Play Snake Game' }),
    ).toBeEnabled();
  });

  it('opens the existing Harvest Rush game from its card', () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play Harvest Rush' }));

    expect(
      screen.getByRole('heading', { name: 'Every decision has a cost.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Open field plan/ }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /All games/ }),
    ).toBeInTheDocument();
  });

  it('loads the static Snake game when its card is selected', () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play Snake Game' }));

    const gameFrame = screen.getByTitle('Snake Game');
    expect(gameFrame).toHaveAttribute(
      'src',
      'https://mohammerd.github.io/Snakegame/',
    );
    expect(
      screen.getByRole('link', { name: /Open in new tab/ }),
    ).toHaveAttribute('href', 'https://mohammerd.github.io/Snakegame/');
  });
});
