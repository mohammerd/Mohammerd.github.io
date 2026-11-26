import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { withBasePath } from '@/lib/utils';
import PlayPage from '../play/page';

describe('play page', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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
    expect(screen.getByRole('button', { name: /Dig Plot 6/ })).toBeEnabled();
    expect(
      screen.getByRole('region', {
        name: 'Full-screen AgroGuardAI farm game',
      }),
    ).toHaveClass('play-game-screen');
    expect(
      screen.getByRole('button', { name: /All games/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enter browser full screen' }),
    ).toBeEnabled();
  });

  it('places farm controls below a full-width field', () => {
    const { container } = render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play AgroGuardAI' }));

    const layout = container.querySelector('.farm-game-layout');
    const mapColumn = layout?.querySelector('.farm-map-column');
    const sidePanel = layout?.querySelector('.farm-side-panel');

    expect(layout?.children[0]).toBe(mapColumn);
    expect(layout?.children[1]).toBe(sidePanel);
    expect(mapColumn?.querySelector('.farm-world')).toBeInTheDocument();
    expect(
      mapColumn?.querySelector('.farm-movement-controls'),
    ).toBeInTheDocument();
    expect(sidePanel?.querySelector('.farm-toolbelt')).toBeInTheDocument();
    expect(
      sidePanel?.querySelector('.farm-primary-action'),
    ).toBeInTheDocument();
    expect(
      sidePanel?.querySelector('.farm-secondary-action'),
    ).toBeInTheDocument();
  });

  it('automatically equips the next tool as a plot moves through a growing cycle', () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play AgroGuardAI' }));

    expect(screen.getByRole('button', { name: 'Tool: Hoe' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dig Plot 6' }));
    expect(
      screen.getByRole('button', { name: 'Tool: Seed bag' }),
    ).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Plant tomatoes' }));
    expect(screen.getByRole('button', { name: 'Tool: Water' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Water Plot 6' }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Water Plot 6' }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));

    expect(
      screen.getByRole('button', { name: 'Tool: Basket' }),
    ).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Harvest Plot 6' }));
    expect(
      screen.getByRole('button', { name: 'Tool: Seed bag' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('returns to the game library when Escape is pressed outside native fullscreen', () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play AgroGuardAI' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(
      screen.getByRole('heading', { name: 'Choose a game.' }),
    ).toBeInTheDocument();
  });

  it('loads the static Snake game when its card is selected', () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Play Snake Game' }));

    expect(
      screen.getByRole('region', { name: 'Full-screen Snake game' }),
    ).toHaveClass('play-game-screen');

    const gameFrame = screen.getByTitle('Snake Game');
    expect(gameFrame).toHaveAttribute('src', withBasePath('/Snakegame/'));
    expect(
      screen.getByRole('link', { name: /Open in new tab/ }),
    ).toHaveAttribute('href', withBasePath('/Snakegame/'));
  });
});
