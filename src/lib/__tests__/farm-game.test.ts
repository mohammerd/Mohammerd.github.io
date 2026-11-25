import { describe, expect, it } from 'vitest';

import {
  advanceFarmDay,
  createInitialFarmState,
  FARM_GOAL_REWARD,
  FARM_WATER_CAPACITY,
  getFarmWeather,
  harvestFarmPlot,
  isCropReady,
  isValidFarmState,
  plantFarmCrop,
  refillFarmWater,
  tillFarmPlot,
  waterFarmPlot,
} from '../farm-game';

describe('farm simulation rules', () => {
  it('starts with six untouched plots and a small seed budget', () => {
    const farm = createInitialFarmState();
    expect(farm.day).toBe(1);
    expect(farm.coins).toBe(26);
    expect(farm.water).toBe(FARM_WATER_CAPACITY);
    expect(farm.plots).toHaveLength(6);
    expect(farm.plots.every((plot) => plot.crop === null && !plot.tilled)).toBe(true);
  });

  it('requires soil preparation before planting and charges for seeds', () => {
    const farm = createInitialFarmState();
    expect(plantFarmCrop(farm, 1, 'tomato')).toBe(farm);

    const prepared = tillFarmPlot(farm, 1);
    expect(prepared.plots[0].tilled).toBe(true);
    expect(tillFarmPlot(prepared, 1)).toBe(prepared);

    const planted = plantFarmCrop(prepared, 1, 'tomato');
    expect(planted.coins).toBe(21);
    expect(planted.plots[0]).toEqual({
      id: 1,
      crop: 'tomato',
      growth: 0,
      watered: false,
      tilled: true,
    });
    expect(plantFarmCrop(planted, 1, 'okra')).toBe(planted);
  });

  it('does not allow a crop to grow unless it was watered that day', () => {
    const prepared = tillFarmPlot(createInitialFarmState(), 1);
    const planted = plantFarmCrop(prepared, 1, 'tomato');
    const dryDay = advanceFarmDay(planted);
    expect(dryDay.day).toBe(2);
    expect(dryDay.plots[0].growth).toBe(0);

    const watered = waterFarmPlot(dryDay, 1);
    expect(watered.plots[0].watered).toBe(true);
    const grown = advanceFarmDay(watered);
    expect(grown.plots[0].growth).toBe(1);
    expect(grown.plots[0].watered).toBe(false);
  });

  it('uses water from the tank and lets the farmer refill at the well', () => {
    const prepared = tillFarmPlot(createInitialFarmState(), 1);
    const planted = plantFarmCrop(prepared, 1, 'tomato');
    const watered = waterFarmPlot(planted, 1);

    expect(watered.water).toBe(FARM_WATER_CAPACITY - 1);
    expect(waterFarmPlot(watered, 1)).toBe(watered);

    const refilled = refillFarmWater(watered);
    expect(refilled.water).toBe(FARM_WATER_CAPACITY);
    expect(refillFarmWater(refilled)).toBe(refilled);
  });

  it('uses two water units during a heatwave', () => {
    let farm = createInitialFarmState();
    for (let day = 1; day < 5; day += 1) {
      farm = advanceFarmDay(farm);
    }

    expect(getFarmWeather(farm.day).id).toBe('heatwave');
    farm = plantFarmCrop(tillFarmPlot(farm, 1), 1, 'tomato');
    const watered = waterFarmPlot(farm, 1);

    expect(watered.water).toBe(FARM_WATER_CAPACITY - 2);
    expect(watered.plots[0].watered).toBe(true);
  });

  it('does not spend tank water when rain will irrigate the field', () => {
    let farm = createInitialFarmState();
    farm = plantFarmCrop(tillFarmPlot(farm, 1), 1, 'tomato');
    farm = advanceFarmDay(advanceFarmDay(farm));

    expect(getFarmWeather(farm.day).id).toBe('rainy');
    expect(waterFarmPlot(farm, 1)).toBe(farm);
    expect(advanceFarmDay(farm).plots[0].growth).toBe(1);
  });

  it('lets rain water growing crops automatically overnight', () => {
    let farm = createInitialFarmState();
    farm = plantFarmCrop(tillFarmPlot(farm, 1), 1, 'tomato');
    farm = advanceFarmDay(advanceFarmDay(farm));

    expect(getFarmWeather(farm.day).id).toBe('rainy');
    const rainyMorning = advanceFarmDay(farm);
    expect(rainyMorning.plots[0].growth).toBe(1);
    expect(rainyMorning.plots[0].watered).toBe(false);
  });

  it('keeps harvest locked until the crop reaches its final growth stage', () => {
    const prepared = tillFarmPlot(createInitialFarmState(), 1);
    const planted = plantFarmCrop(prepared, 1, 'tomato');
    expect(isCropReady(planted.plots[0])).toBe(false);
    expect(harvestFarmPlot(planted, 1).crop).toBeNull();

    const dayTwo = advanceFarmDay(waterFarmPlot(planted, 1));
    const ready = advanceFarmDay(waterFarmPlot(dayTwo, 1));
    expect(isCropReady(ready.plots[0])).toBe(true);

    const harvested = harvestFarmPlot(ready, 1);
    expect(harvested.crop?.name).toBe('Tomatoes');
    expect(harvested.state.plots[0]).toEqual({
      id: 1,
      crop: null,
      growth: 0,
      watered: false,
      tilled: true,
    });
    expect(harvested.state.coins).toBe(ready.coins + 15);
  });

  it('awards the farm goal bonus once after four successful harvests', () => {
    let farm = createInitialFarmState();
    for (let harvest = 0; harvest < 4; harvest += 1) {
      const plotId = harvest + 1;
      farm = tillFarmPlot(farm, plotId);
      farm = plantFarmCrop(farm, plotId, 'okra');
      farm = advanceFarmDay(waterFarmPlot(farm, plotId));
      farm = harvestFarmPlot(farm, plotId).state;
    }

    expect(farm.harvested).toBe(4);
    expect(farm.goalComplete).toBe(true);
    expect(farm.coins).toBe(26 - 4 * 4 + 4 * 12 + FARM_GOAL_REWARD);

    farm = refillFarmWater(farm);
    farm = plantFarmCrop(tillFarmPlot(farm, 5), 5, 'okra');
    farm = harvestFarmPlot(advanceFarmDay(waterFarmPlot(farm, 5)), 5).state;
    expect(farm.goalComplete).toBe(true);
    expect(farm.coins).toBe(26 - 5 * 4 + 5 * 12 + FARM_GOAL_REWARD);
  });

  it('rejects malformed saved farms and missing soil state', () => {
    expect(isValidFarmState(createInitialFarmState())).toBe(true);
    expect(isValidFarmState({ day: 0 })).toBe(false);
    expect(isValidFarmState(null)).toBe(false);

    const legacyShape = createInitialFarmState() as unknown as {
      plots: Array<Record<string, unknown>>;
    };
    const withoutTilled = {
      ...createInitialFarmState(),
      plots: legacyShape.plots.map(({ tilled: _tilled, ...plot }) => plot),
    };
    expect(isValidFarmState(withoutTilled)).toBe(false);
  });
});
