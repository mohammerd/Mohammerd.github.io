export const FARM_GOAL = 4;
export const FARM_GOAL_REWARD = 20;
export const FARM_PLOT_COUNT = 6;
export const FARM_WATER_CAPACITY = 5;

export const FARM_CROPS = [
  {
    id: 'tomato',
    name: 'Tomatoes',
    seedCost: 5,
    sellPrice: 15,
    growDays: 2,
    description: 'Balanced crop',
    color: '#e65c4f',
  },
  {
    id: 'maize',
    name: 'Maize',
    seedCost: 3,
    sellPrice: 9,
    growDays: 2,
    description: 'Low-cost crop',
    color: '#e4bd4e',
  },
  {
    id: 'pepper',
    name: 'Peppers',
    seedCost: 6,
    sellPrice: 18,
    growDays: 3,
    description: 'Higher reward',
    color: '#e77b48',
  },
  {
    id: 'okra',
    name: 'Okra',
    seedCost: 4,
    sellPrice: 12,
    growDays: 1,
    description: 'Quick harvest',
    color: '#70a957',
  },
  {
    id: 'beans',
    name: 'Beans',
    seedCost: 5,
    sellPrice: 16,
    growDays: 2,
    description: 'Reliable harvest',
    color: '#8e9c4f',
  },
  {
    id: 'groundnut',
    name: 'Groundnuts',
    seedCost: 6,
    sellPrice: 20,
    growDays: 3,
    description: 'Slow-growing, high value',
    color: '#c68b45',
  },
] as const;

export type FarmCropId = (typeof FARM_CROPS)[number]['id'];
export type FarmCrop = (typeof FARM_CROPS)[number];

export type FarmWeatherId = 'sunny' | 'cloudy' | 'rainy' | 'heatwave';

export interface FarmWeather {
  id: FarmWeatherId;
  label: string;
  icon: string;
  description: string;
  tip: string;
}

const FARM_WEATHER_CYCLE: FarmWeather[] = [
  {
    id: 'sunny',
    label: 'Sunny',
    icon: '☀',
    description: 'Warm and bright',
    tip: 'Water your crops before nightfall.',
  },
  {
    id: 'cloudy',
    label: 'Cloudy',
    icon: '☁',
    description: 'Cool with cloud cover',
    tip: 'A good day to work the field.',
  },
  {
    id: 'rainy',
    label: 'Rain',
    icon: '☂',
    description: 'Rain showers expected',
    tip: 'Rain waters every planted crop overnight.',
  },
  {
    id: 'sunny',
    label: 'Sunny',
    icon: '☀',
    description: 'Warm and bright',
    tip: 'Water your crops before nightfall.',
  },
  {
    id: 'heatwave',
    label: 'Heatwave',
    icon: '☼',
    description: 'Hot, dry conditions',
    tip: 'Crops need double water today.',
  },
  {
    id: 'cloudy',
    label: 'Cloudy',
    icon: '☁',
    description: 'Cool with cloud cover',
    tip: 'A good day to work the field.',
  },
  {
    id: 'rainy',
    label: 'Rain',
    icon: '☂',
    description: 'Rain showers expected',
    tip: 'Rain waters every planted crop overnight.',
  },
];

export function getFarmWeather(day: number): FarmWeather {
  const safeDay = Number.isFinite(day) ? Math.max(1, Math.floor(day)) : 1;
  return FARM_WEATHER_CYCLE[(safeDay - 1) % FARM_WEATHER_CYCLE.length];
}

export interface FarmPlot {
  id: number;
  crop: FarmCropId | null;
  growth: number;
  watered: boolean;
  tilled: boolean;
}

export interface FarmState {
  day: number;
  coins: number;
  water: number;
  harvested: number;
  goalComplete: boolean;
  plots: FarmPlot[];
}

export const FARM_SAVE_KEY = 'mohammerd.agroguardai.farm.v3';
export const PREVIOUS_FARM_SAVE_KEY = 'mohammerd.agroguardai.farm.v2';
export const LEGACY_FARM_SAVE_KEY = 'mohammerd.harvest-rush.farm.v1';

export function createInitialFarmState(): FarmState {
  return {
    day: 1,
    coins: 26,
    water: FARM_WATER_CAPACITY,
    harvested: 0,
    goalComplete: false,
    plots: Array.from({ length: FARM_PLOT_COUNT }, (_, index) => ({
      id: index + 1,
      crop: null,
      growth: 0,
      watered: false,
      tilled: false,
    })),
  };
}

export function getFarmCrop(id: FarmCropId): FarmCrop {
  const crop = FARM_CROPS.find((candidate) => candidate.id === id);
  if (!crop) throw new Error('Unknown farm crop: ' + id);
  return crop;
}

export function isCropReady(plot: FarmPlot): boolean {
  return plot.crop !== null && plot.growth >= getFarmCrop(plot.crop).growDays;
}

export function tillFarmPlot(state: FarmState, plotId: number): FarmState {
  const index = state.plots.findIndex((plot) => plot.id === plotId);
  if (
    index < 0 ||
    state.plots[index].crop !== null ||
    state.plots[index].tilled
  ) {
    return state;
  }

  const plots = [...state.plots];
  plots[index] = { ...plots[index], tilled: true };
  return { ...state, plots };
}

export function plantFarmCrop(
  state: FarmState,
  plotId: number,
  cropId: FarmCropId,
): FarmState {
  const index = state.plots.findIndex((plot) => plot.id === plotId);
  const crop = getFarmCrop(cropId);
  if (
    index < 0 ||
    state.plots[index].crop !== null ||
    !state.plots[index].tilled ||
    state.coins < crop.seedCost
  ) {
    return state;
  }

  const plots = [...state.plots];
  plots[index] = {
    ...plots[index],
    crop: cropId,
    growth: 0,
    watered: false,
  };
  return { ...state, coins: state.coins - crop.seedCost, plots };
}

export function waterFarmPlot(state: FarmState, plotId: number): FarmState {
  const index = state.plots.findIndex((plot) => plot.id === plotId);
  const plot = index >= 0 ? state.plots[index] : null;
  const waterCost = getFarmWeather(state.day).id === 'heatwave' ? 2 : 1;

  if (
    !plot ||
    plot.crop === null ||
    plot.watered ||
    isCropReady(plot) ||
    state.water < waterCost
  ) {
    return state;
  }

  const plots = [...state.plots];
  plots[index] = { ...plots[index], watered: true };
  return { ...state, water: state.water - waterCost, plots };
}

export function refillFarmWater(state: FarmState): FarmState {
  if (state.water >= FARM_WATER_CAPACITY) return state;
  return { ...state, water: FARM_WATER_CAPACITY };
}

export function advanceFarmDay(state: FarmState): FarmState {
  const weather = getFarmWeather(state.day);
  const rainWatersCrops = weather.id === 'rainy';

  return {
    ...state,
    day: state.day + 1,
    plots: state.plots.map((plot) => {
      if (!plot.crop) return plot;
      const receivedWater = plot.watered || rainWatersCrops;
      return {
        ...plot,
        growth: receivedWater
          ? Math.min(getFarmCrop(plot.crop).growDays, plot.growth + 1)
          : plot.growth,
        watered: false,
      };
    }),
  };
}

export function harvestFarmPlot(
  state: FarmState,
  plotId: number,
): { state: FarmState; crop: FarmCrop | null; goalReward: number } {
  const index = state.plots.findIndex((plot) => plot.id === plotId);
  if (index < 0 || !isCropReady(state.plots[index])) {
    return { state, crop: null, goalReward: 0 };
  }

  const plot = state.plots[index];
  const crop = getFarmCrop(plot.crop as FarmCropId);
  const harvested = state.harvested + 1;
  const completedNow = !state.goalComplete && harvested >= FARM_GOAL;
  const goalReward = completedNow ? FARM_GOAL_REWARD : 0;
  const plots = [...state.plots];
  plots[index] = {
    ...plot,
    crop: null,
    growth: 0,
    watered: false,
    tilled: true,
  };

  return {
    crop,
    goalReward,
    state: {
      ...state,
      coins: state.coins + crop.sellPrice + goalReward,
      harvested,
      goalComplete: state.goalComplete || completedNow,
      plots,
    },
  };
}

export function isValidFarmState(value: unknown): value is FarmState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FarmState>;
  if (
    !Number.isInteger(candidate.day) ||
    Number(candidate.day) < 1 ||
    !Number.isInteger(candidate.coins) ||
    Number(candidate.coins) < 0 ||
    !Number.isInteger(candidate.water) ||
    Number(candidate.water) < 0 ||
    Number(candidate.water) > FARM_WATER_CAPACITY ||
    !Number.isInteger(candidate.harvested) ||
    Number(candidate.harvested) < 0 ||
    typeof candidate.goalComplete !== 'boolean' ||
    !Array.isArray(candidate.plots) ||
    candidate.plots.length !== FARM_PLOT_COUNT
  ) {
    return false;
  }

  return candidate.plots.every((plot, index) => {
    if (!plot || typeof plot !== 'object') return false;
    const validCrop =
      plot.crop === null || FARM_CROPS.some((crop) => crop.id === plot.crop);
    return (
      plot.id === index + 1 &&
      validCrop &&
      Number.isInteger(plot.growth) &&
      plot.growth >= 0 &&
      typeof plot.watered === 'boolean' &&
      typeof plot.tilled === 'boolean' &&
      (plot.crop === null
        ? plot.growth === 0 && !plot.watered
        : plot.tilled && plot.growth <= getFarmCrop(plot.crop).growDays)
    );
  });
}
