export const HARVEST_RUSH_RULES = {
  harvestSlots: 3,
  crewLimit: 7,
  truckCapacity: 11,
  clearHarvests: 2,
  goldScore: 50,
  silverScore: 44,
  bronzeScore: 36,
} as const;

export interface HarvestField {
  id: string;
  number: string;
  crop: string;
  description: string;
  crates: number;
  crew: number;
  pointsPerCrate: number;
  rainLoss: number;
  fieldNote: string;
}

export const HARVEST_FIELDS = [
  {
    id: 'tomatoes',
    number: '01',
    crop: 'Tomatoes',
    description: 'High-value produce with a narrow harvest window.',
    crates: 4,
    crew: 2,
    pointsPerCrate: 5,
    rainLoss: 0.4,
    fieldNote: 'Rain-sensitive',
  },
  {
    id: 'peppers',
    number: '02',
    crop: 'Peppers',
    description: 'Premium market value; quality drops in heavy rain.',
    crates: 3,
    crew: 2,
    pointsPerCrate: 6,
    rainLoss: 0.35,
    fieldNote: 'Rain-sensitive',
  },
  {
    id: 'maize',
    number: '03',
    crop: 'Maize',
    description: 'A dependable bulk crop that tolerates the weather.',
    crates: 5,
    crew: 2,
    pointsPerCrate: 3,
    rainLoss: 0,
    fieldNote: 'Weather-safe',
  },
  {
    id: 'cassava',
    number: '04',
    crop: 'Cassava',
    description: 'A strong return, but it takes more hands to lift.',
    crates: 4,
    crew: 3,
    pointsPerCrate: 4,
    rainLoss: 0,
    fieldNote: 'Weather-safe',
  },
  {
    id: 'okra',
    number: '05',
    crop: 'Okra',
    description: 'Quick to harvest, with a smaller total return.',
    crates: 3,
    crew: 1,
    pointsPerCrate: 4,
    rainLoss: 0.25,
    fieldNote: 'Rain-sensitive',
  },
] as const satisfies readonly HarvestField[];

export type HarvestFieldId = (typeof HARVEST_FIELDS)[number]['id'];

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
  rainAffected: boolean;
  score: number;
  lostPoints: number;
}

export interface HarvestResult {
  score: number;
  grade: 'Gold' | 'Silver' | 'Bronze' | 'Keep practising';
  outcomes: HarvestOutcome[];
}

function getField(id: HarvestFieldId) {
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
      const field = getField(id);
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

/** Returns the reason a field cannot be added, or null when it is available. */
export function getFieldAvailability(
  fieldIds: readonly HarvestFieldId[],
  candidateId: HarvestFieldId,
): string | null {
  if (fieldIds.includes(candidateId)) {
    return 'Already in plan';
  }
  if (fieldIds.length >= HARVEST_RUSH_RULES.harvestSlots) {
    return 'All harvest slots are filled';
  }

  const field = getField(candidateId);
  const current = getHarvestMetrics(fieldIds);

  if (current.crew + field.crew > HARVEST_RUSH_RULES.crewLimit) {
    return 'Crew limit reached';
  }
  if (current.crates + field.crates > HARVEST_RUSH_RULES.truckCapacity) {
    return 'Truck capacity reached';
  }

  return null;
}

/** Scores a plan in its current order, including the storm after slot two. */
export function previewHarvestPlan(
  fieldIds: readonly HarvestFieldId[],
): HarvestOutcome[] {
  return fieldIds.map((id, index) => {
    const field = getField(id);
    const slot = index + 1;
    const baseScore = field.crates * field.pointsPerCrate;
    const rainAffected =
      slot > HARVEST_RUSH_RULES.clearHarvests && field.rainLoss > 0;
    const score = rainAffected
      ? Math.round(baseScore * (1 - field.rainLoss))
      : baseScore;

    return {
      field,
      slot,
      baseScore,
      rainAffected,
      score,
      lostPoints: baseScore - score,
    };
  });
}

export function evaluateHarvestPlan(
  fieldIds: readonly HarvestFieldId[],
): HarvestResult {
  if (fieldIds.length !== HARVEST_RUSH_RULES.harvestSlots) {
    throw new Error('A dispatch requires exactly three fields.');
  }

  const metrics = getHarvestMetrics(fieldIds);
  if (
    metrics.crew > HARVEST_RUSH_RULES.crewLimit ||
    metrics.crates > HARVEST_RUSH_RULES.truckCapacity
  ) {
    throw new Error('The harvest plan exceeds its available resources.');
  }

  const outcomes = previewHarvestPlan(fieldIds);
  const score = outcomes.reduce((total, outcome) => total + outcome.score, 0);

  const grade =
    score >= HARVEST_RUSH_RULES.goldScore
      ? 'Gold'
      : score >= HARVEST_RUSH_RULES.silverScore
        ? 'Silver'
        : score >= HARVEST_RUSH_RULES.bronzeScore
          ? 'Bronze'
          : 'Keep practising';

  return { score, grade, outcomes };
}
