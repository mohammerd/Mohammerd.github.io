import { describe, expect, it } from 'vitest';

import {
  evaluateHarvestPlan,
  getFieldAvailability,
  getHarvestMetrics,
  getHarvestMission,
  getWeatherRiskLabel,
  HARVEST_FIELDS,
  HARVEST_MISSIONS,
  previewHarvestPlan,
} from '../harvest-rush';

describe('Harvest Rush campaign rules', () => {
  it('defines three distinct missions with meaningful operating constraints', () => {
    expect(HARVEST_MISSIONS.map((mission) => mission.weather)).toEqual([
      'rain',
      'heat',
      'dust',
    ]);
    expect(
      HARVEST_MISSIONS.map((mission) => mission.exposureAfterSlots),
    ).toEqual([2, 1, 2]);
    expect(HARVEST_MISSIONS[2].crewLimit).toBe(5);
  });

  it('keeps the opening mission within its crew and truck limits', () => {
    const plan = ['tomatoes', 'okra', 'cassava'] as const;
    const metrics = getHarvestMetrics(plan);

    expect(metrics).toMatchObject({ slots: 3, crates: 11, crew: 6 });
    expect(metrics.crew).toBe(HARVEST_MISSIONS[0].crewLimit);
    expect(metrics.crates).toBe(HARVEST_MISSIONS[0].truckCapacity);
  });

  it('blocks duplicate fields, over-capacity plans, and over-staffed plans', () => {
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

  it('uses the selected weather and exposure window in the preview', () => {
    const rain = previewHarvestPlan(
      ['tomatoes', 'peppers', 'okra'],
      getHarvestMission('storm-front'),
    );
    const heat = previewHarvestPlan(
      ['tomatoes', 'peppers', 'okra'],
      getHarvestMission('heatwave'),
    );

    expect(rain.map((outcome) => outcome.score)).toEqual([20, 18, 9]);
    expect(heat.map((outcome) => outcome.score)).toEqual([20, 14, 9]);
    expect(heat[1].weatherAffected).toBe(true);
  });

  it('rewards protecting high-risk crops before the storm', () => {
    const protectedPlan = evaluateHarvestPlan(['tomatoes', 'okra', 'cassava']);
    const exposedPlan = evaluateHarvestPlan(['okra', 'peppers', 'tomatoes']);

    expect(protectedPlan.score).toBe(48);
    expect(protectedPlan.grade).toBe('Gold');
    expect(protectedPlan.stars).toBe(3);
    expect(exposedPlan.score).toBe(42);
    expect(exposedPlan.outcomes[2].weatherAffected).toBe(true);
  });

  it('uses each mission’s own weather, crew, truck, and score targets', () => {
    const heatPlan = evaluateHarvestPlan(
      ['tomatoes', 'okra', 'cassava'],
      getHarvestMission('heatwave'),
    );
    const dustPlan = evaluateHarvestPlan(
      ['tomatoes', 'peppers', 'okra'],
      getHarvestMission('dust-run'),
    );

    expect(heatPlan.score).toBe(44);
    expect(heatPlan.grade).toBe('Gold');
    expect(dustPlan.score).toBe(48);
    expect(dustPlan.grade).toBe('Gold');
    expect(
      getFieldAvailability(
        ['tomatoes', 'okra'],
        'cassava',
        getHarvestMission('dust-run'),
      ),
    ).toBe('Crew limit reached');
  });

  it('rejects incomplete, duplicate, and over-budget plans before dispatch', () => {
    expect(() => evaluateHarvestPlan(['tomatoes', 'peppers'])).toThrow(
      'A dispatch requires exactly three fields.',
    );
    expect(() =>
      evaluateHarvestPlan(['tomatoes', 'tomatoes', 'cassava']),
    ).toThrow('A field can only be harvested once.');
    expect(() => evaluateHarvestPlan(['tomatoes', 'maize', 'cassava'])).toThrow(
      'The harvest plan exceeds its available resources.',
    );
  });

  it('does not penalise weather-resilient crops after the event', () => {
    const outcomes = previewHarvestPlan(['tomatoes', 'okra', 'cassava']);

    expect(outcomes[2]).toMatchObject({
      weatherAffected: false,
      score: 16,
      lostPoints: 0,
    });
  });

  it('labels field exposure relative to the current mission', () => {
    const peppers = HARVEST_FIELDS.find((field) => field.id === 'peppers');
    const cassava = HARVEST_FIELDS.find((field) => field.id === 'cassava');

    expect(peppers).toBeDefined();
    expect(cassava).toBeDefined();
    if (!peppers || !cassava) return;

    expect(getWeatherRiskLabel(peppers, getHarvestMission('heatwave'))).toBe(
      'Moderate exposure',
    );
    expect(getWeatherRiskLabel(cassava, getHarvestMission('storm-front'))).toBe(
      'Resilient',
    );
  });
});
