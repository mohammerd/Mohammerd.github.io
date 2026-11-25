import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { withBasePath } from '@/lib/utils';
import PlayPage from '../play/page';

describe('play page', () => {
  it('shows both playable games in the selection grid', () => {
    render(<PlayPage />);

    expect(screen.getByRole('heading', { name: 'Play' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Choose a game.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Play AgroGuardAI' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Play Snake Game' }),
    ).toBeEnabled();
  });

  it('opens the AgroGuardAI farming game from its library entry', () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play AgroGuardAI' }));

    expect(
      screen.getByRole('heading', { name: 'Build a working farm.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Dig Plot 6/ }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /All games/ }),
    ).toBeInTheDocument();
  });

  it('loads the static Snake game when its card is selected', () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play Snake Game' }));

    const gameFrame = screen.getByTitle('Snake Game');
    expect(gameFrame).toHaveAttribute('src', withBasePath('/Snakegame/'));
    expect(
      screen.getByRole('link', { name: /Open in new tab/ }),
    ).toHaveAttribute('href', withBasePath('/Snakegame/'));
  });
});
