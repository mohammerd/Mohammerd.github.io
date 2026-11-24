import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import HarvestRushGame from './HarvestRushGame';

describe('Harvest Rush game', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the five fields and the mission constraints', () => {
    render(<HarvestRushGame />);

    expect(
      screen.getByRole('heading', { name: 'Available fields' }),
    ).toBeInTheDocument();

    for (const crop of ['Tomatoes', 'Peppers', 'Maize', 'Cassava', 'Okra']) {
      expect(
        screen.getByRole('button', { name: new RegExp(crop + ',') }),
      ).toBeInTheDocument();
    }

    expect(screen.getByText(/rain after slot 02/i)).toBeInTheDocument();
    expect(screen.getByText('0/6')).toBeInTheDocument();
  });

  it('blocks a plan that exceeds the crew limit', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Tomatoes, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Peppers, 3 crates/ }));

    expect(
      screen.getByRole('button', { name: /Cassava, 4 crates/ }),
    ).toBeDisabled();
    expect(screen.getByText('Crew limit reached')).toBeInTheDocument();
  });

  it('rewards a plan that protects exposed crops before the storm', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Tomatoes, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Okra, 3 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Cassava, 4 crates/ }));

    expect(
      screen.getByRole('button', { name: /Dispatch harvest/ }),
    ).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /Dispatch harvest/ }));

    const result = screen.getByText('Gold').parentElement;
    expect(result).toHaveTextContent('48');
    expect(
      screen.getByText(/protected vulnerable crops/i),
    ).toBeInTheDocument();
  });

  it('recalculates the preview when a field is moved before the storm', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Tomatoes, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Cassava, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Okra, 3 crates/ }));

    expect(screen.getByText('45', { exact: true })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Move Okra earlier' }),
    );

    expect(screen.getByText('48', { exact: true })).toBeInTheDocument();
  });

  it('allows the player to restart a completed mission', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Tomatoes, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Okra, 3 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Cassava, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Dispatch harvest/ }));
    fireEvent.click(screen.getByRole('button', { name: /Run mission again/ }));

    expect(screen.getByText('0/3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Dispatch harvest/ }),
    ).toBeDisabled();
  });
});
