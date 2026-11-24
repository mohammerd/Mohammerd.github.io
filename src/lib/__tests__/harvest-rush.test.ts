import { describe, expect, it } from 'vitest';

import {
  evaluateHarvestPlan,
  getFieldAvailability,
  getHarvestMetrics,
  HARVEST_RUSH_RULES,
  previewHarvestPlan,
} from '../harvest-rush';

describe('Harvest Rush mission rules', () => {
  it('keeps a three-field plan within the published crew and truck limits', () => {
    const plan = ['tomatoes', 'okra', 'cassava'] as const;
    const metrics = getHarvestMetrics(plan);

    expect(metrics).toMatchObject({ slots: 3, crates: 11, crew: 6 });
    expect(metrics.crew).toBe(HARVEST_RUSH_RULES.crewLimit);
    expect(metrics.crates).toBe(HARVEST_RUSH_RULES.truckCapacity);
  });

  it('rejects duplicate fields and plans that exceed crew or truck limits', () => {
    expect(getFieldAvailability(['tomatoes'], 'tomatoes')).toBe(
      'Already in plan',
    );
    expect(getFieldAvailability(['tomatoes', 'maize'], 'peppers')).toBe(
      'Truck capacity reached',
    );
    expect(getFieldAvailability(['tomatoes', 'peppers'], 'cassava')).toBe(
      'Crew limit reached',
    );
  });

  it('keeps rain-sensitive crops at full value in the first two slots', () => {
    const outcomes = previewHarvestPlan(['tomatoes', 'peppers', 'okra']);

    expect(outcomes.map((outcome) => outcome.score)).toEqual([20, 18, 9]);
    expect(outcomes[0].rainAffected).toBe(false);
    expect(outcomes[1].rainAffected).toBe(false);
    expect(outcomes[2].rainAffected).toBe(true);
  });

  it('changes the result when a rain-sensitive crop is moved into the storm slot', () => {
    const protectedPlan = evaluateHarvestPlan([
      'tomatoes',
      'okra',
      'cassava',
    ]);
    const exposedPlan = evaluateHarvestPlan(['okra', 'peppers', 'tomatoes']);

    expect(protectedPlan.score).toBe(48);
    expect(protectedPlan.grade).toBe('Gold');
    expect(exposedPlan.score).toBe(42);
    expect(exposedPlan.outcomes[2].rainAffected).toBe(true);
  });

  it('requires three valid fields before dispatch', () => {
    expect(() => evaluateHarvestPlan(['tomatoes', 'peppers'])).toThrow(
      'A dispatch requires exactly three fields.',
    );
    expect(() =>
      evaluateHarvestPlan(['tomatoes', 'maize', 'cassava']),
    ).toThrow('The harvest plan exceeds its available resources.');
  });

  it('does not penalise crops marked as weather-safe', () => {
    const outcomes = previewHarvestPlan(['tomatoes', 'okra', 'cassava']);

    expect(outcomes[2]).toMatchObject({
      rainAffected: false,
      score: 16,
      lostPoints: 0,
    });
  });
});
