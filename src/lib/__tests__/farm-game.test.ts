import { describe, expect, it } from 'vitest';

import {
  advanceFarmDay,
  createInitialFarmState,
  FARM_GOAL_REWARD,
  harvestFarmPlot,
  isCropReady,
  isValidFarmState,
  plantFarmCrop,
  waterFarmPlot,
} from '../farm-game';

describe('farm simulation rules', () => {
  it('starts with six empty plots and a small seed budget', () => {
    const farm = createInitialFarmState();
    expect(farm.day).toBe(1);
    expect(farm.coins).toBe(26);
    expect(farm.plots).toHaveLength(6);
    expect(farm.plots.every((plot) => plot.crop === null)).toBe(true);
  });

  it('charges for seeds and refuses to plant into an occupied plot', () => {
    const farm = createInitialFarmState();
    const planted = plantFarmCrop(farm, 1, 'tomato');

    expect(planted.coins).toBe(21);
    expect(planted.plots[0]).toEqual({
      id: 1,
      crop: 'tomato',
      growth: 0,
      watered: false,
    });
    expect(plantFarmCrop(planted, 1, 'okra')).toBe(planted);
  });

  it('does not allow a crop to grow unless it was watered that day', () => {
    const planted = plantFarmCrop(createInitialFarmState(), 1, 'tomato');
    const dryDay = advanceFarmDay(planted);
    expect(dryDay.day).toBe(2);
    expect(dryDay.plots[0].growth).toBe(0);

    const watered = waterFarmPlot(dryDay, 1);
    expect(watered.plots[0].watered).toBe(true);
    const grown = advanceFarmDay(watered);
    expect(grown.plots[0].growth).toBe(1);
    expect(grown.plots[0].watered).toBe(false);
  });

  it('keeps harvest locked until the crop reaches its final growth stage', () => {
    const planted = plantFarmCrop(createInitialFarmState(), 1, 'tomato');
    expect(isCropReady(planted.plots[0])).toBe(false);
    expect(harvestFarmPlot(planted, 1).crop).toBeNull();

    const dayTwo = advanceFarmDay(waterFarmPlot(planted, 1));
    const ready = advanceFarmDay(waterFarmPlot(dayTwo, 1));
    expect(isCropReady(ready.plots[0])).toBe(true);

    const harvested = harvestFarmPlot(ready, 1);
    expect(harvested.crop?.name).toBe('Tomatoes');
    expect(harvested.state.plots[0].crop).toBeNull();
    expect(harvested.state.coins).toBe(ready.coins + 15);
  });

  it('awards the farm goal bonus once after four successful harvests', () => {
    let farm = createInitialFarmState();
    for (let harvest = 0; harvest < 4; harvest += 1) {
      const plotId = harvest + 1;
      farm = plantFarmCrop(farm, plotId, 'okra');
      farm = advanceFarmDay(waterFarmPlot(farm, plotId));
      farm = harvestFarmPlot(farm, plotId).state;
    }

    expect(farm.harvested).toBe(4);
    expect(farm.goalComplete).toBe(true);
    expect(farm.coins).toBe(26 - 4 * 4 + 4 * 12 + FARM_GOAL_REWARD);

    farm = plantFarmCrop(farm, 5, 'okra');
    farm = harvestFarmPlot(advanceFarmDay(waterFarmPlot(farm, 5)), 5).state;
    expect(farm.goalComplete).toBe(true);
    expect(farm.coins).toBe(26 - 5 * 4 + 5 * 12 + FARM_GOAL_REWARD);
  });

  it('rejects malformed saved farms', () => {
    expect(isValidFarmState(createInitialFarmState())).toBe(true);
    expect(isValidFarmState({ day: 0 })).toBe(false);
    expect(isValidFarmState(null)).toBe(false);
  });
});
