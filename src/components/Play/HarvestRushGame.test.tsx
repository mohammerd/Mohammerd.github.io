import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  createInitialFarmState,
  FARM_SAVE_KEY,
  LEGACY_FARM_SAVE_KEY,
  PREVIOUS_FARM_SAVE_KEY,
} from '@/lib/farm-game';
import HarvestRushGame from './HarvestRushGame';

describe('AgroGuardAI farm simulation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens with a farm field, a movable farmer and a four-harvest contract', () => {
    render(<HarvestRushGame />);

    expect(
      screen.getByRole('heading', { name: 'Build a working farm.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {
        name: /Farm field. Focus this area and use WASD or arrow keys/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Plot 1: empty, untouched soil' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Plot 6: empty, untouched soil' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'First farm contract progress' }),
    ).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('Sunny')).toBeInTheDocument();
    expect(screen.getByText(/Tomorrow: ☁ Cloudy/)).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move north' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Tool: Hoe' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('requires the farmer to be near a plot and the soil to be tilled before planting', () => {
    render(<HarvestRushGame />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Plot 1: empty, untouched soil' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dig Plot 1' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      /Walk closer to Plot 1/,
    );

    for (let step = 0; step < 6; step += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Move west' }));
    }
    for (let step = 0; step < 3; step += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Move north' }));
    }

    fireEvent.click(screen.getByRole('button', { name: 'Dig Plot 1' }));
    expect(
      screen.getByRole('button', { name: 'Plot 1: empty, tilled soil' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tool: Seed bag' }));
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Choose crop seed' }),
      {
        target: { value: 'pepper' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Plant peppers' }));

    expect(
      screen.getByRole('button', { name: 'Plot 1: Peppers, growing' }),
    ).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('lets the farmer plant, water, grow and harvest a crop with different tools', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: 'Dig Plot 6' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tool: Seed bag' }));
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Choose crop seed' }),
      {
        target: { value: 'tomato' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Plant tomatoes' }));

    fireEvent.click(screen.getByRole('button', { name: 'Tool: Water' }));
    fireEvent.click(screen.getByRole('button', { name: 'Water Plot 6' }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));
    expect(screen.getByText('Growth · 1 of 2 days')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Water Plot 6' }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));
    expect(screen.getByText('Crop is ready to pick')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tool: Basket' }));
    fireEvent.click(screen.getByRole('button', { name: 'Harvest Plot 6' }));

    expect(
      screen.getByRole('button', { name: 'Plot 6: empty, tilled soil' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'First farm contract progress' }),
    ).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'You harvested Tomatoes. +15 coins.',
    );
  });

  it('does not grow a crop left dry before the day ends', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: 'Dig Plot 6' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tool: Seed bag' }));
    fireEvent.click(screen.getByRole('button', { name: 'Plant tomatoes' }));
    fireEvent.click(screen.getByRole('button', { name: /End day/ }));

    expect(screen.getByText('Growth · 0 of 2 days')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      /Dry crops did not grow/,
    );
  });

  it('uses the equipped tool with E and switches tools with number keys', () => {
    render(<HarvestRushGame />);
    const field = screen.getByRole('group', {
      name: /Farm field. Focus this area and use WASD or arrow keys/i,
    });

    fireEvent.keyDown(field, { key: 'e' });
    expect(
      screen.getByRole('button', { name: 'Plot 6: empty, tilled soil' }),
    ).toBeInTheDocument();

    fireEvent.keyDown(field, { key: '2' });
    expect(
      screen.getByRole('button', { name: 'Tool: Seed bag' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('moves the farmer with the keyboard controls', () => {
    render(<HarvestRushGame />);
    const field = screen.getByRole('group', {
      name: /Farm field. Focus this area and use WASD or arrow keys/i,
    });
    const player = field.querySelector('.farm-player');
    const startingPosition = player?.getAttribute('style');

    fireEvent.keyDown(field, { key: 'ArrowLeft' });

    expect(player?.getAttribute('style')).not.toBe(startingPosition);
  });

  it('migrates saved Harvest Rush progress into the AgroGuardAI save format', async () => {
    const legacy = createInitialFarmState();
    const { water: _water, ...legacyWithoutWater } = legacy;
    const legacyPlots = legacy.plots.map(
      ({ tilled: _tilled, ...plot }, index) =>
        index === 5
          ? { ...plot, crop: 'tomato', growth: 1, watered: false }
          : plot,
    );
    window.localStorage.setItem(
      LEGACY_FARM_SAVE_KEY,
      JSON.stringify({ ...legacyWithoutWater, plots: legacyPlots }),
    );

    render(<HarvestRushGame />);

    await waitFor(() => {
      const saved = window.localStorage.getItem(FARM_SAVE_KEY);
      expect(saved).not.toBeNull();
      expect(saved).toContain('"crop":"tomato"');
      expect(saved).toContain('"tilled":true');
    });
    expect(screen.getByText('26')).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
  });

  it('migrates the previous AgroGuardAI save format with a full water tank', async () => {
    const { water: _water, ...previousSave } = createInitialFarmState();
    window.localStorage.setItem(
      PREVIOUS_FARM_SAVE_KEY,
      JSON.stringify(previousSave),
    );

    render(<HarvestRushGame />);

    await waitFor(() => {
      const saved = window.localStorage.getItem(FARM_SAVE_KEY);
      expect(saved).not.toBeNull();
      expect(saved).toContain('"water":5');
    });
    expect(screen.getByText('5/5')).toBeInTheDocument();
  });

  it('refills the water tank only after walking to the well', async () => {
    const savedFarm = { ...createInitialFarmState(), water: 0 };
    window.localStorage.setItem(FARM_SAVE_KEY, JSON.stringify(savedFarm));
    render(<HarvestRushGame />);

    await waitFor(() => {
      expect(screen.getByText('0/5')).toBeInTheDocument();
    });

    for (let step = 0; step < 8; step += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Move east' }));
    }
    for (let step = 0; step < 3; step += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Move south' }));
    }

    fireEvent.click(screen.getByRole('button', { name: 'Tool: Water' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refill water tank' }));

    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      /Water tank refilled at the well/,
    );
  });
});
