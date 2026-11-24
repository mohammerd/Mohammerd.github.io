export type WeatherType = 'rain' | 'heat' | 'dust';

export type HarvestFieldId =
  | 'tomatoes'
  | 'peppers'
  | 'maize'
  | 'cassava'
  | 'okra';

export type HarvestMissionId = 'storm-front' | 'heatwave' | 'dust-run';

export interface HarvestField {
  id: HarvestFieldId;
  number: string;
  crop: string;
  description: string;
  crates: number;
  crew: number;
  pointsPerCrate: number;
  weatherLoss: Readonly<Record<WeatherType, number>>;
  fieldNote: string;
  bestFor: string;
}

export interface HarvestMission {
  id: HarvestMissionId;
  number: string;
  title: string;
  subtitle: string;
  briefing: string;
  objective: string;
  weather: WeatherType;
  weatherName: string;
  weatherDetail: string;
  exposureAfterSlots: number;
  crewLimit: number;
  truckCapacity: number;
  goldScore: number;
  silverScore: number;
  bronzeScore: number;
}

export const HARVEST_RUSH_RULES = {
  harvestSlots: 3,
} as const;

export const HARVEST_FIELDS = [
  {
    id: 'tomatoes',
    number: '01',
    crop: 'Tomatoes',
    description: 'Premium value. Quality falls quickly in difficult weather.',
    crates: 4,
    crew: 2,
    pointsPerCrate: 5,
    weatherLoss: { rain: 0.4, heat: 0.22, dust: 0.15 },
    fieldNote: 'Delicate produce',
    bestFor: 'High-value early harvest',
  },
  {
    id: 'peppers',
    number: '02',
    crop: 'Peppers',
    description: 'Strong market value, but exposed fruit loses quality.',
    crates: 3,
    crew: 2,
    pointsPerCrate: 6,
    weatherLoss: { rain: 0.35, heat: 0.2, dust: 0.22 },
    fieldNote: 'Weather-sensitive',
    bestFor: 'High value per crate',
  },
  {
    id: 'maize',
    number: '03',
    crop: 'Maize',
    description: 'Reliable bulk yield with moderate weather resilience.',
    crates: 5,
    crew: 2,
    pointsPerCrate: 3,
    weatherLoss: { rain: 0, heat: 0.08, dust: 0.08 },
    fieldNote: 'Reliable bulk crop',
    bestFor: 'High-volume collection',
  },
  {
    id: 'cassava',
    number: '04',
    crop: 'Cassava',
    description: 'A steady return, although lifting it needs more hands.',
    crates: 4,
    crew: 3,
    pointsPerCrate: 4,
    weatherLoss: { rain: 0, heat: 0.05, dust: 0.02 },
    fieldNote: 'Weather-resilient',
    bestFor: 'Reliable late harvest',
  },
  {
    id: 'okra',
    number: '05',
    crop: 'Okra',
    description: 'Quick to collect, but vulnerable once conditions turn.',
    crates: 3,
    crew: 1,
    pointsPerCrate: 4,
    weatherLoss: { rain: 0.25, heat: 0.28, dust: 0.18 },
    fieldNote: 'Fast, delicate crop',
    bestFor: 'Flexible low-labour option',
  },
] as const satisfies readonly HarvestField[];

export const HARVEST_MISSIONS = [
  {
    id: 'storm-front',
    number: '01',
    title: 'The Storm Front',
    subtitle: 'Get the delicate crops in before the rain.',
    briefing:
      'Clouds are gathering over the eastern plots. Your first two harvest teams have a clear window. By the third run, heavy rain will be across the farm.',
    objective: 'Keep rain-sensitive crops out of the final slot.',
    weather: 'rain',
    weatherName: 'Heavy rain',
    weatherDetail: 'Rain reaches the fields after harvest 02.',
    exposureAfterSlots: 2,
    crewLimit: 6,
    truckCapacity: 11,
    goldScore: 48,
    silverScore: 46,
    bronzeScore: 43,
  },
  {
    id: 'heatwave',
    number: '02',
    title: 'The Heat Window',
    subtitle: 'The temperature rises earlier than expected.',
    briefing:
      'A hot, dry wind is moving in from the north. The first team gets a clean run. Every field harvested after that loses some quality, but not every crop reacts in the same way.',
    objective:
      'Use the first clear harvest slot for the most heat-sensitive crop.',
    weather: 'heat',
    weatherName: 'Heatwave',
    weatherDetail: 'High temperatures begin after harvest 01.',
    exposureAfterSlots: 1,
    crewLimit: 6,
    truckCapacity: 11,
    goldScore: 44,
    silverScore: 42,
    bronzeScore: 38,
  },
  {
    id: 'dust-run',
    number: '03',
    title: 'The Dust Run',
    subtitle: 'A narrow road and a smaller crew change the plan.',
    briefing:
      'Dust is rolling across the access road. The truck can still make three runs, but the crew is short today. Prioritise value, keep the load within capacity, and leave resilient crops until last.',
    objective: 'Make every crew unit count and protect fragile produce.',
    weather: 'dust',
    weatherName: 'Dust storm',
    weatherDetail: 'Dust reaches the fields after harvest 02.',
    exposureAfterSlots: 2,
    crewLimit: 5,
    truckCapacity: 11,
    goldScore: 47,
    silverScore: 44,
    bronzeScore: 40,
  },
] as const satisfies readonly HarvestMission[];

export type HarvestGrade = 'Gold' | 'Silver' | 'Bronze' | 'Developing';

export interface HarvestMetrics {
  crates: number;
  crew: number;
  slots: number;
  baseScore: number;
}

export interface HarvestOutcome {
  field: (typeof HARVEST_FIELDS)[number];
  slot: number;
  baseScore: number;
  weatherAffected: boolean;
  weatherLoss: number;
  score: number;
  lostPoints: number;
}

export interface HarvestResult {
  mission: HarvestMission;
  score: number;
  grade: HarvestGrade;
  stars: number;
  baseScore: number;
  lostPoints: number;
  outcomes: HarvestOutcome[];
  metrics: HarvestMetrics;
}

export const DEFAULT_HARVEST_MISSION = HARVEST_MISSIONS[0];

export function getHarvestMission(id: HarvestMissionId) {
  const mission = HARVEST_MISSIONS.find((candidate) => candidate.id === id);
  if (!mission) {
    throw new Error('Unknown harvest mission: ' + id);
  }
  return mission;
}

export function getHarvestField(id: HarvestFieldId) {
  const field = HARVEST_FIELDS.find((candidate) => candidate.id === id);
  if (!field) {
    throw new Error('Unknown harvest field: ' + id);
  }
  return field;
}

export function getHarvestMetrics(
  fieldIds: readonly HarvestFieldId[],
): HarvestMetrics {
  return fieldIds.reduce<HarvestMetrics>(
    (totals, id) => {
      const field = getHarvestField(id);
      return {
        crates: totals.crates + field.crates,
        crew: totals.crew + field.crew,
        slots: totals.slots + 1,
        baseScore: totals.baseScore + field.crates * field.pointsPerCrate,
      };
    },
    { crates: 0, crew: 0, slots: 0, baseScore: 0 },
  );
}

/** Return the reason a field cannot be added, or null when it is available. */
export function getFieldAvailability(
  fieldIds: readonly HarvestFieldId[],
  candidateId: HarvestFieldId,
  mission: HarvestMission = DEFAULT_HARVEST_MISSION,
): string | null {
  if (fieldIds.includes(candidateId)) {
    return 'Already in plan';
  }
  if (fieldIds.length >= HARVEST_RUSH_RULES.harvestSlots) {
    return 'All harvest slots are filled';
  }

  const field = getHarvestField(candidateId);
  const current = getHarvestMetrics(fieldIds);

  if (current.crew + field.crew > mission.crewLimit) {
    return 'Crew limit reached';
  }
  if (current.crates + field.crates > mission.truckCapacity) {
    return 'Truck capacity reached';
  }

  return null;
}

/** Score a plan in its current order against the selected mission's weather. */
export function previewHarvestPlan(
  fieldIds: readonly HarvestFieldId[],
  mission: HarvestMission = DEFAULT_HARVEST_MISSION,
): HarvestOutcome[] {
  return fieldIds.map((id, index) => {
    const field = getHarvestField(id);
    const slot = index + 1;
    const baseScore = field.crates * field.pointsPerCrate;
    const weatherLoss = field.weatherLoss[mission.weather];
    const weatherAffected =
      slot > mission.exposureAfterSlots && weatherLoss > 0;
    const score = weatherAffected
      ? Math.round(baseScore * (1 - weatherLoss))
      : baseScore;

    return {
      field,
      slot,
      baseScore,
      weatherAffected,
      weatherLoss: weatherAffected ? weatherLoss : 0,
      score,
      lostPoints: baseScore - score,
    };
  });
}

export function evaluateHarvestPlan(
  fieldIds: readonly HarvestFieldId[],
  mission: HarvestMission = DEFAULT_HARVEST_MISSION,
): HarvestResult {
  if (fieldIds.length !== HARVEST_RUSH_RULES.harvestSlots) {
    throw new Error('A dispatch requires exactly three fields.');
  }
  if (new Set(fieldIds).size !== fieldIds.length) {
    throw new Error('A field can only be harvested once.');
  }

  const metrics = getHarvestMetrics(fieldIds);
  if (
    metrics.crew > mission.crewLimit ||
    metrics.crates > mission.truckCapacity
  ) {
    throw new Error('The harvest plan exceeds its available resources.');
  }

  const outcomes = previewHarvestPlan(fieldIds, mission);
  const score = outcomes.reduce((total, outcome) => total + outcome.score, 0);
  const lostPoints = outcomes.reduce(
    (total, outcome) => total + outcome.lostPoints,
    0,
  );
  const grade: HarvestGrade =
    score >= mission.goldScore
      ? 'Gold'
      : score >= mission.silverScore
        ? 'Silver'
        : score >= mission.bronzeScore
          ? 'Bronze'
          : 'Developing';
  const stars =
    grade === 'Gold' ? 3 : grade === 'Silver' ? 2 : grade === 'Bronze' ? 1 : 0;

  return {
    mission,
    score,
    grade,
    stars,
    baseScore: metrics.baseScore,
    lostPoints,
    outcomes,
    metrics,
  };
}

export function getWeatherRiskLabel(
  field: HarvestField,
  mission: HarvestMission,
): 'High exposure' | 'Moderate exposure' | 'Resilient' {
  const risk = field.weatherLoss[mission.weather];
  if (risk >= 0.25) return 'High exposure';
  if (risk >= 0.1) return 'Moderate exposure';
  return 'Resilient';
}
