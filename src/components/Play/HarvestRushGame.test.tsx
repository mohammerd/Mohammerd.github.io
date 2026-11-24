import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import HarvestRushGame from './HarvestRushGame';

const planStrongStormRun = () => {
  fireEvent.click(screen.getByRole('button', { name: /Tomatoes, 4 crates/ }));
  fireEvent.click(screen.getByRole('button', { name: /Okra, 3 crates/ }));
  fireEvent.click(screen.getByRole('button', { name: /Cassava, 4 crates/ }));
};

describe('Harvest Rush campaign experience', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with a clear briefing and keeps later missions locked', () => {
    render(<HarvestRushGame />);

    expect(screen.getByRole('heading', { name: 'Every decision has a cost.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Storm Front' })).toBeInTheDocument();
    expect(screen.getByText(/Keep rain-sensitive crops out of the final slot/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Mission 02: The Heat Window, locked/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /Mission 03: The Dust Run, locked/i }),
    ).toBeDisabled();
  });

  it('opens the planning board with live weather and resource feedback', () => {
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));

    expect(screen.getByRole('heading', { name: 'Choose your fields' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your harvest order' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Crew assigned' })).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('button', { name: /Dispatch harvest/ })).toBeDisabled();
  });

  it('prevents resource overflow and allows selected fields to be removed again', () => {
    render(<HarvestRushGame />);
    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));

    const tomatoes = screen.getByRole('button', { name: /Tomatoes, 4 crates/ });
    fireEvent.click(tomatoes);
    fireEvent.click(screen.getByRole('button', { name: /Peppers, 3 crates/ }));

    expect(screen.getByRole('button', { name: /Cassava, 4 crates/ })).toBeDisabled();
    expect(screen.getByText('Crew limit reached')).toBeInTheDocument();

    fireEvent.click(tomatoes);
    expect(tomatoes).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('progressbar', { name: 'Crew assigned' })).toHaveAttribute('aria-valuenow', '2');
  });

  it('recalculates the score when a field is moved ahead of the storm', () => {
    render(<HarvestRushGame />);
    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));

    fireEvent.click(screen.getByRole('button', { name: /Tomatoes, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Cassava, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Okra, 3 crates/ }));

    const summary = screen.getByText('Projected operation score').parentElement;
    expect(summary).toHaveTextContent('45');
    expect(screen.getByText(/−3 pts · exposed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Move Okra earlier' }));

    expect(summary).toHaveTextContent('48');
    expect(screen.getByText(/Weather resilient/i)).toBeInTheDocument();
  });

  it('clears the opening mission, saves the best, and unlocks the heat mission', async () => {
    render(<HarvestRushGame />);
    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));
    planStrongStormRun();

    fireEvent.click(screen.getByRole('button', { name: /Dispatch harvest/ }));

    expect(screen.getByRole('heading', { name: 'You managed the operation well.' })).toBeInTheDocument();
    expect(screen.getByText('FINAL HARVEST SCORE').parentElement).toHaveTextContent('48');

    await waitFor(() => {
      const saved = JSON.parse(
        window.localStorage.getItem('mohammerd.harvest-rush.campaign.v2') ?? '{}',
      );
      expect(saved.completed).toContain('storm-front');
      expect(saved.bestScores['storm-front']).toBe(48);
    });

    expect(
      screen.getByRole('button', { name: /Continue to next mission/ }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /Continue to next mission/ }));

    expect(screen.getByRole('heading', { name: 'The Heat Window' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Mission 03: The Dust Run, locked/i }),
    ).toBeDisabled();
  });

  it('applies the second mission weather and unlocks the final scenario', () => {
    render(<HarvestRushGame />);
    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));
    planStrongStormRun();
    fireEvent.click(screen.getByRole('button', { name: /Dispatch harvest/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to next mission/ }));
    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));

    expect(screen.getByText(/High temperatures begin after harvest 01/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tomatoes, 4 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Okra, 3 crates/ }));
    fireEvent.click(screen.getByRole('button', { name: /Cassava, 4 crates/ }));
    expect(screen.getByText('Projected operation score').parentElement).toHaveTextContent('44');

    fireEvent.click(screen.getByRole('button', { name: /Dispatch harvest/ }));

    expect(screen.getByRole('button', { name: /Continue to next mission/ })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /Continue to next mission/ }));

    expect(screen.getByRole('heading', { name: 'The Dust Run' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Mission 03: The Dust Run, available/i }),
    ).toBeEnabled();
  });


  it('migrates the previous personal-best score into the campaign record', async () => {
    window.localStorage.setItem('mohammerd.harvest-rush.best.v1', '52');
    render(<HarvestRushGame />);

    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));
    planStrongStormRun();
    fireEvent.click(screen.getByRole('button', { name: /Dispatch harvest/ }));

    await waitFor(() => {
      const saved = JSON.parse(
        window.localStorage.getItem('mohammerd.harvest-rush.campaign.v2') ?? '{}',
      );
      expect(saved.bestScores['storm-front']).toBe(52);
    });
  });

  it('keeps a completed mission replayable without relocking campaign progress', () => {
    render(<HarvestRushGame />);
    fireEvent.click(screen.getByRole('button', { name: /Open field plan/ }));
    planStrongStormRun();
    fireEvent.click(screen.getByRole('button', { name: /Dispatch harvest/ }));

    fireEvent.click(screen.getByRole('button', { name: /Replay mission/ }));

    expect(screen.getByRole('heading', { name: 'Choose your fields' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mission 02: The Heat Window, available/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Dispatch harvest/ })).toBeDisabled();
  });
});
