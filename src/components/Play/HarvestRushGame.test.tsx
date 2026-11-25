import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import HarvestRushGame from './HarvestRushGame';

describe('Harvest Rush farm simulation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens with a visible farm map and a four-harvest starter goal', () => {
    render(<HarvestRushGame />);

    expect(
      screen.getByRole('heading', { name: 'Make this farm yours.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {
        name: /Top-down farm map. Select one of the six garden plots/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Plot 1: empty bed' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Plot 6: empty bed' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Starter goal progress' }),
    ).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText(/Four simple steps/)).toBeInTheDocument();
  });

  it('lets a player select a plot, choose seeds, and plant within their budget', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: 'Plot 2: empty bed' }));
    fireEvent.click(screen.getByRole('button', { name: /Peppers, 6 coins/ }));
    fireEvent.click(screen.getByRole('button', { name: /Plant peppers/ }));

    expect(
      screen.getByRole('button', { name: /Plot 2: Peppers, growing/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Water this crop/ }),
    ).toBeEnabled();
    expect(
      screen.getByText(/Water the soil, then end the day/),
    ).toBeInTheDocument();
  });

  it('grows a watered crop over two days and sells it when harvested', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Plant tomatoes/ }));
    fireEvent.click(screen.getByRole('button', { name: /Water this crop/ }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));

    expect(screen.getByText('Growing · Day 1 of 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Water this crop/ }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));

    expect(screen.getByText('Ready to harvest!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Harvest tomatoes/ }));

    expect(
      screen.getByRole('button', { name: 'Plot 1: empty bed' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Starter goal progress' }),
    ).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'You harvested Tomatoes. +15 coins.',
    );
  });

  it('does not grow a crop that was left dry before ending the day', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Plant tomatoes/ }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));

    expect(screen.getByText('Growing · Day 0 of 2')).toBeInTheDocument();
    expect(
      screen.getByText(/Water your crops before ending the day/),
    ).toBeInTheDocument();
  });

  it('awards the starter reward once and restores saved farm progress', async () => {
    const { unmount } = render(<HarvestRushGame />);

    for (let harvest = 0; harvest < 4; harvest += 1) {
      const plotName = `Plot ${harvest + 1}: empty bed`;
      fireEvent.click(screen.getByRole('button', { name: plotName }));
      fireEvent.click(screen.getByRole('button', { name: /Okra, 4 coins/ }));
      fireEvent.click(screen.getByRole('button', { name: /Plant okra/ }));
      fireEvent.click(screen.getByRole('button', { name: /Water this crop/ }));
      fireEvent.click(screen.getByRole('button', { name: /End day/ }));
      fireEvent.click(screen.getByRole('button', { name: /Harvest okra/ }));
    }

    expect(screen.getByText('Starter farm complete!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/20-coin reward/);
    await waitFor(() => {
      expect(
        window.localStorage.getItem('mohammerd.harvest-rush.farm.v1'),
      ).toContain('"goalComplete":true');
    });

    unmount();
    render(<HarvestRushGame />);
    expect(screen.getByText('Starter farm complete!')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Starter goal progress' }),
    ).toHaveAttribute('aria-valuenow', '4');
  });
});
