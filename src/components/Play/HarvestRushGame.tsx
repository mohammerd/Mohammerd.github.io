'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  evaluateHarvestPlan,
  getFieldAvailability,
  getHarvestMetrics,
  getHarvestMission,
  getWeatherRiskLabel,
  HARVEST_FIELDS,
  HARVEST_MISSIONS,
  HARVEST_RUSH_RULES,
  type HarvestFieldId,
  type HarvestMissionId,
  type HarvestResult,
  previewHarvestPlan,
  type WeatherType,
} from '@/lib/harvest-rush';
import { withBasePath } from '@/lib/utils';

const PROGRESS_KEY = 'mohammerd.harvest-rush.campaign.v2';

interface PlayerProgress {
  bestScores: Partial<Record<HarvestMissionId, number>>;
  completed: HarvestMissionId[];
}

const EMPTY_PROGRESS: PlayerProgress = {
  bestScores: {},
  completed: [],
};

function readProgress(): PlayerProgress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      const legacyScore = Number(
        window.localStorage.getItem('mohammerd.harvest-rush.best.v1'),
      );
      return Number.isFinite(legacyScore) && legacyScore > 0
        ? { bestScores: { 'storm-front': legacyScore }, completed: [] }
        : EMPTY_PROGRESS;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_PROGRESS;

    const candidate = parsed as Partial<PlayerProgress>;
    const validIds = HARVEST_MISSIONS.map((mission) => mission.id);
    const completed = Array.isArray(candidate.completed)
      ? candidate.completed.filter(
          (id): id is HarvestMissionId =>
            typeof id === 'string' && validIds.includes(id as HarvestMissionId),
        )
      : [];
    const bestScores: PlayerProgress['bestScores'] = {};

    if (candidate.bestScores && typeof candidate.bestScores === 'object') {
      for (const id of validIds) {
        const score = candidate.bestScores[id];
        if (typeof score === 'number' && Number.isFinite(score) && score >= 0) {
          bestScores[id] = score;
        }
      }
    }

    const legacyScore = Number(
      window.localStorage.getItem('mohammerd.harvest-rush.best.v1'),
    );
    if (
      bestScores['storm-front'] === undefined &&
      Number.isFinite(legacyScore) &&
      legacyScore > 0
    ) {
      bestScores['storm-front'] = legacyScore;
    }

    return {
      bestScores,
      completed: [...new Set(completed)],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

const CROP_ILLUSTRATIONS: Record<HarvestFieldId, string> = {
  tomatoes: '/images/harvest-rush/tomatoes.svg',
  peppers: '/images/harvest-rush/peppers.svg',
  maize: '/images/harvest-rush/maize.svg',
  cassava: '/images/harvest-rush/cassava.svg',
  okra: '/images/harvest-rush/okra.svg',
};

const WEATHER_ILLUSTRATIONS: Record<WeatherType, string> = {
  rain: '/images/harvest-rush/rain.svg',
  heat: '/images/harvest-rush/heat.svg',
  dust: '/images/harvest-rush/dust.svg',
};

function CropArt({ fieldId }: { fieldId: HarvestFieldId }) {
  return (
    <img
      className="harvest-crop-illustration"
      src={withBasePath(CROP_ILLUSTRATIONS[fieldId])}
      alt=""
      aria-hidden="true"
      width={96}
      height={96}
      loading="lazy"
      decoding="async"
    />
  );
}

function WeatherMark({ weather }: { weather: WeatherType }) {
  return (
    <img
      src={withBasePath(WEATHER_ILLUSTRATIONS[weather])}
      alt=""
      aria-hidden="true"
      width={48}
      height={48}
      decoding="async"
    />
  );
}

function ResourceMeter({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit: string;
}) {
  const ratio = Math.min(100, (used / limit) * 100);
  const tone =
    ratio >= 90 ? 'is-near-limit' : ratio >= 70 ? 'is-mid-limit' : '';

  return (
    <div className={'harvest-resource ' + tone}>
      <div className="harvest-resource-heading">
        <span>{label}</span>
        <strong>
          {used}
          <small>
            {' '}
            / {limit} {unit}
          </small>
        </strong>
      </div>
      <div
        className="harvest-resource-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
      >
        <span style={{ width: ratio + '%' }} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="harvest-hero-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function WeatherTimeline({
  mission,
}: {
  mission: ReturnType<typeof getHarvestMission>;
}) {
  return (
    <div
      className="harvest-weather-timeline"
      role="group"
      aria-label="Weather timeline"
    >
      {[1, 2, 3].map((slot) => {
        const exposed = slot > mission.exposureAfterSlots;
        return (
          <div
            key={slot}
            className={
              'harvest-weather-step ' + (exposed ? 'is-exposed' : 'is-clear')
            }
          >
            <span className="harvest-weather-step-index">0{slot}</span>
            <strong>{exposed ? mission.weatherName : 'Clear window'}</strong>
            <small>{exposed ? 'Weather risk' : 'Full quality'}</small>
          </div>
        );
      })}
    </div>
  );
}

function CampaignProgress({
  completed,
  unlockedCount,
}: {
  completed: HarvestMissionId[];
  unlockedCount: number;
}) {
  return (
    <div className="harvest-campaign-progress">
      <div className="harvest-campaign-progress-copy">
        <span className="harvest-micro-label">CAMPAIGN PROGRESS</span>
        <strong>
          {completed.length}{' '}
          <small>of {HARVEST_MISSIONS.length} missions cleared</small>
        </strong>
      </div>
      <div
        className="harvest-campaign-track"
        role="progressbar"
        aria-label="Campaign progress"
        aria-valuemin={0}
        aria-valuemax={HARVEST_MISSIONS.length}
        aria-valuenow={completed.length}
      >
        <span
          style={{
            width: (completed.length / HARVEST_MISSIONS.length) * 100 + '%',
          }}
        />
      </div>
      <span className="harvest-campaign-unlocked">
        {unlockedCount} {unlockedCount === 1 ? 'mission' : 'missions'} available
      </span>
    </div>
  );
}

function MissionSelector({
  selectedId,
  completed,
  unlockedCount,
  onSelect,
}: {
  selectedId: HarvestMissionId;
  completed: HarvestMissionId[];
  unlockedCount: number;
  onSelect: (id: HarvestMissionId) => void;
}) {
  return (
    <nav className="harvest-mission-selector" aria-label="Campaign missions">
      {HARVEST_MISSIONS.map((mission, index) => {
        const isUnlocked = index < unlockedCount;
        const isCompleted = completed.includes(mission.id);
        const isSelected = mission.id === selectedId;

        return (
          <button
            key={mission.id}
            type="button"
            className={
              'harvest-mission-tab' +
              (isSelected ? ' is-selected' : '') +
              (isCompleted ? ' is-completed' : '') +
              (!isUnlocked ? ' is-locked' : '')
            }
            onClick={() => onSelect(mission.id)}
            disabled={!isUnlocked}
            aria-current={isSelected ? 'step' : undefined}
            aria-label={
              'Mission ' +
              mission.number +
              ': ' +
              mission.title +
              (isCompleted
                ? ', completed'
                : !isUnlocked
                  ? ', locked'
                  : ', available')
            }
          >
            <span className="harvest-mission-tab-number">
              {isCompleted ? '✓' : mission.number}
            </span>
            <span className="harvest-mission-tab-copy">
              <strong>{mission.title}</strong>
              <small>
                {isCompleted
                  ? 'Cleared'
                  : isUnlocked
                    ? mission.weatherName
                    : 'Complete previous mission'}
              </small>
            </span>
            <span className="harvest-mission-tab-status" aria-hidden="true">
              {!isUnlocked ? '–' : isCompleted ? '✓' : isSelected ? '●' : '○'}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default function HarvestRushGame() {
  const [selectedMissionId, setSelectedMissionId] =
    useState<HarvestMissionId>('storm-front');
  const [phase, setPhase] = useState<'briefing' | 'planning'>('briefing');
  const [plan, setPlan] = useState<HarvestFieldId[]>([]);
  const [result, setResult] = useState<HarvestResult | null>(null);
  const [progress, setProgress] = useState<PlayerProgress>(EMPTY_PROGRESS);
  const [progressReady, setProgressReady] = useState(false);

  const mission = useMemo(
    () => getHarvestMission(selectedMissionId),
    [selectedMissionId],
  );
  const metrics = useMemo(() => getHarvestMetrics(plan), [plan]);
  const preview = useMemo(
    () => previewHarvestPlan(plan, mission),
    [plan, mission],
  );
  const projectedScore = preview.reduce(
    (total, outcome) => total + outcome.score,
    0,
  );
  const planIsComplete = plan.length === HARVEST_RUSH_RULES.harvestSlots;
  const missionIndex = HARVEST_MISSIONS.findIndex(
    (candidate) => candidate.id === selectedMissionId,
  );
  const firstIncompleteMission = HARVEST_MISSIONS.findIndex(
    (candidate) => !progress.completed.includes(candidate.id),
  );
  const unlockedCount =
    firstIncompleteMission === -1
      ? HARVEST_MISSIONS.length
      : firstIncompleteMission + 1;
  const bestScore = progress.bestScores[selectedMissionId] ?? null;
  const nextMission = HARVEST_MISSIONS[missionIndex + 1] ?? null;
  const nextMissionUnlocked = nextMission
    ? progress.completed.includes(selectedMissionId)
    : false;

  useEffect(() => {
    setProgress(readProgress());
    setProgressReady(true);
  }, []);

  useEffect(() => {
    if (!progressReady) return;

    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // The campaign remains playable when browser storage is unavailable.
    }
  }, [progress, progressReady]);

  function selectMission(id: HarvestMissionId) {
    const index = HARVEST_MISSIONS.findIndex(
      (candidate) => candidate.id === id,
    );
    if (index < 0 || index >= unlockedCount) return;

    setSelectedMissionId(id);
    setPhase('briefing');
    setPlan([]);
    setResult(null);
  }

  function beginPlanning() {
    setPlan([]);
    setResult(null);
    setPhase('planning');
  }

  function toggleField(fieldId: HarvestFieldId) {
    if (result) return;

    if (plan.includes(fieldId)) {
      setPlan((current) => current.filter((id) => id !== fieldId));
      return;
    }

    if (getFieldAvailability(plan, fieldId, mission)) return;
    setPlan((current) => [...current, fieldId]);
  }

  function moveField(fieldId: HarvestFieldId, direction: -1 | 1) {
    if (result) return;

    setPlan((current) => {
      const from = current.indexOf(fieldId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;

      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  function dispatchHarvest() {
    if (!planIsComplete || result) return;

    const outcome = evaluateHarvestPlan(plan, mission);
    setResult(outcome);
    setProgress((current) => {
      const currentBest = current.bestScores[selectedMissionId] ?? 0;
      return {
        bestScores: {
          ...current.bestScores,
          [selectedMissionId]: Math.max(currentBest, outcome.score),
        },
        completed:
          outcome.grade === 'Developing' ||
          current.completed.includes(selectedMissionId)
            ? current.completed
            : [...current.completed, selectedMissionId],
      };
    });
  }

  function replayMission() {
    setPlan([]);
    setResult(null);
    setPhase('planning');
  }

  function returnToBriefing() {
    setPlan([]);
    setResult(null);
    setPhase('briefing');
  }

  const completionBest = result
    ? Math.max(bestScore ?? 0, result.score)
    : bestScore;

  return (
    <section className="harvest-game" aria-label="Harvest Rush campaign">
      <div className="harvest-game-topbar">
        <div className="harvest-game-brand">
          <span className="harvest-brand-mark" aria-hidden="true">
            <img
              src={withBasePath('/images/harvest-rush/brand-mark.svg')}
              alt=""
              width={36}
              height={36}
              decoding="async"
            />
          </span>
          <span>
            <strong>HARVEST RUSH</strong>
            <small>FIELD OPERATIONS SIMULATOR</small>
          </span>
        </div>
        <div className="harvest-game-topbar-meta">
          <span className="harvest-local-badge">
            <span aria-hidden="true" /> SAVES ON THIS DEVICE
          </span>
          <span className="harvest-game-version">CAMPAIGN 01 / 03</span>
        </div>
      </div>

      <div className="harvest-campaign-header">
        <div className="harvest-campaign-title-block">
          <span className="harvest-micro-label">THE HARVEST CAMPAIGN</span>
          <h2>Every decision has a cost.</h2>
          <p>
            Plan the work, protect the crop, and get the best return from the
            crew and truck you have.
          </p>
        </div>
        <CampaignProgress
          completed={progress.completed}
          unlockedCount={unlockedCount}
        />
      </div>

      <MissionSelector
        selectedId={selectedMissionId}
        completed={progress.completed}
        unlockedCount={unlockedCount}
        onSelect={selectMission}
      />

      <div className="harvest-mission-context">
        <div className="harvest-mission-context-main">
          <div className="harvest-mission-heading">
            <span className="harvest-mission-number">
              MISSION {mission.number}
            </span>
            <span className="harvest-mission-divider" />
            <span className="harvest-mission-status">
              {progress.completed.includes(mission.id)
                ? 'PREVIOUSLY CLEARED'
                : 'AVAILABLE FOR DISPATCH'}
            </span>
          </div>
          <h3>{mission.title}</h3>
          <p>{mission.subtitle}</p>
        </div>
        <div className="harvest-mission-weather">
          <span className="harvest-weather-art">
            <WeatherMark weather={mission.weather} />
          </span>
          <span>
            <small>FIELD CONDITION</small>
            <strong>{mission.weatherName}</strong>
            <em>{mission.weatherDetail}</em>
          </span>
        </div>
      </div>

      {phase === 'briefing' && !result && (
        <div className="harvest-briefing-screen">
          <div className="harvest-briefing-copy">
            <span className="harvest-section-kicker">OPERATIONS BRIEFING</span>
            <h3>Know the conditions before you commit.</h3>
            <p>{mission.briefing}</p>
            <div className="harvest-objective">
              <span className="harvest-objective-icon" aria-hidden="true">
                !
              </span>
              <span>
                <small>MISSION OBJECTIVE</small>
                <strong>{mission.objective}</strong>
              </span>
            </div>
            <div className="harvest-mission-limits">
              <Metric
                label="Harvest slots"
                value={'03'}
                detail="Three field runs"
              />
              <Metric
                label="Available crew"
                value={String(mission.crewLimit)}
                detail="Work units"
              />
              <Metric
                label="Truck capacity"
                value={String(mission.truckCapacity)}
                detail="Crates maximum"
              />
            </div>
            <button
              type="button"
              className="harvest-primary-button"
              onClick={beginPlanning}
            >
              Open field plan <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="harvest-briefing-visual">
            <div className="harvest-weather-card">
              <div className="harvest-weather-card-heading">
                <span>WEATHER WINDOW</span>
                <span>03 HARVESTS</span>
              </div>
              <WeatherTimeline mission={mission} />
              <p>
                Plan the first harvests carefully. Once the weather turns,
                sensitive produce loses value.
              </p>
            </div>
            <div className="harvest-target-card">
              <span className="harvest-target-label">GOLD TARGET</span>
              <strong>
                {mission.goldScore}
                <small> pts</small>
              </strong>
              <span className="harvest-target-note">Three-star operation</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'planning' && !result && (
        <>
          <div className="harvest-stage-guide">
            <span>SELECT FIELDS · SET ORDER · DISPATCH</span>
            <button
              type="button"
              className="harvest-brief-link"
              onClick={returnToBriefing}
            >
              View briefing
            </button>
          </div>

          <div className="harvest-planning-layout">
            <section
              className="harvest-fields-section"
              aria-labelledby="harvest-fields-title"
            >
              <div className="harvest-section-heading">
                <div>
                  <span className="harvest-section-kicker">
                    FIELD REGISTER / 05 PLOTS
                  </span>
                  <h3 id="harvest-fields-title">Choose your fields</h3>
                  <p>
                    Select up to three plots. Tap a selected plot to remove it.
                  </p>
                </div>
                <span className="harvest-selection-count">
                  {plan.length}
                  <small> / 03</small>
                </span>
              </div>

              <div className="harvest-field-grid">
                {HARVEST_FIELDS.map((field) => {
                  const selectedAt = plan.indexOf(field.id);
                  const selected = selectedAt >= 0;
                  const availability = getFieldAvailability(
                    plan,
                    field.id,
                    mission,
                  );
                  const disabled =
                    Boolean(result) || (!selected && Boolean(availability));
                  const risk = getWeatherRiskLabel(field, mission);

                  return (
                    <button
                      key={field.id}
                      type="button"
                      className={
                        'harvest-field' +
                        (selected ? ' is-selected' : '') +
                        (disabled && !selected ? ' is-unavailable' : '')
                      }
                      onClick={() => toggleField(field.id)}
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-label={
                        field.crop +
                        ', ' +
                        field.crates +
                        ' crates, ' +
                        field.crew +
                        ' crew, ' +
                        risk +
                        (selected
                          ? ', selected in slot ' + (selectedAt + 1)
                          : '')
                      }
                    >
                      <span className="harvest-field-art">
                        <CropArt fieldId={field.id} />
                        <span className="harvest-field-number">
                          PLOT {field.number}
                        </span>
                        {selected && (
                          <span
                            className="harvest-field-selected-mark"
                            aria-hidden="true"
                          >
                            {String(selectedAt + 1).padStart(2, '0')}
                          </span>
                        )}
                      </span>
                      <span className="harvest-field-content">
                        <span className="harvest-field-card-heading">
                          <strong>{field.crop}</strong>
                          <span
                            className={
                              'harvest-risk-tag ' +
                              risk.toLowerCase().replaceAll(' ', '-')
                            }
                          >
                            {risk}
                          </span>
                        </span>
                        <span className="harvest-field-description">
                          {field.description}
                        </span>
                        <span className="harvest-field-stats">
                          <span>
                            <strong>{field.crates}</strong> crates
                          </span>
                          <span>
                            <strong>{field.crew}</strong> crew
                          </span>
                          <span>
                            <strong>
                              {field.crates * field.pointsPerCrate}
                            </strong>{' '}
                            base pts
                          </span>
                        </span>
                        {availability && !selected && (
                          <span className="harvest-field-blocked">
                            {availability}
                          </span>
                        )}
                        {selected && (
                          <span className="harvest-field-selected-label">
                            ADDED TO SLOT{' '}
                            {String(selectedAt + 1).padStart(2, '0')}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <aside
              className="harvest-dispatch-panel"
              aria-labelledby="harvest-plan-title"
            >
              <div className="harvest-dispatch-panel-heading">
                <div>
                  <span className="harvest-section-kicker">
                    LIVE DISPATCH BOARD
                  </span>
                  <h3 id="harvest-plan-title">Your harvest order</h3>
                </div>
                <span className="harvest-dispatch-live">
                  <i /> LIVE PREVIEW
                </span>
              </div>

              <div className="harvest-resource-stack">
                <ResourceMeter
                  label="Crew assigned"
                  used={metrics.crew}
                  limit={mission.crewLimit}
                  unit="units"
                />
                <ResourceMeter
                  label="Truck load"
                  used={metrics.crates}
                  limit={mission.truckCapacity}
                  unit="crates"
                />
              </div>

              <ol className="harvest-plan-list">
                {Array.from(
                  { length: HARVEST_RUSH_RULES.harvestSlots },
                  (_, index) => {
                    const outcome = preview[index];
                    const slotClass =
                      'harvest-plan-slot' +
                      (outcome?.weatherAffected ? ' is-exposed' : '') +
                      (outcome ? ' has-field' : '');
                    const weatherClass = outcome?.weatherAffected
                      ? 'has-weather-loss'
                      : 'has-weather-clear';

                    return (
                      <li key={index} className={slotClass}>
                        <span className="harvest-plan-slot-number">
                          0{index + 1}
                        </span>
                        {outcome ? (
                          <div className="harvest-plan-slot-content">
                            <div className="harvest-plan-slot-main">
                              <span className="harvest-plan-crop-name">
                                {outcome.field.crop}
                              </span>
                              <strong>
                                {outcome.score}
                                <small> pts</small>
                              </strong>
                            </div>
                            <div className="harvest-plan-slot-meta">
                              <span>
                                {outcome.field.crates} crates ·{' '}
                                {outcome.field.crew} crew
                              </span>
                              <span className={weatherClass}>
                                {outcome.weatherAffected
                                  ? '−' + outcome.lostPoints + ' pts · exposed'
                                  : outcome.slot > mission.exposureAfterSlots
                                    ? 'Weather resilient'
                                    : 'Clear window'}
                              </span>
                            </div>
                            <div className="harvest-plan-controls">
                              <button
                                type="button"
                                onClick={() => moveField(outcome.field.id, -1)}
                                disabled={index === 0}
                                aria-label={
                                  'Move ' + outcome.field.crop + ' earlier'
                                }
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveField(outcome.field.id, 1)}
                                disabled={index === plan.length - 1}
                                aria-label={
                                  'Move ' + outcome.field.crop + ' later'
                                }
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="harvest-plan-remove"
                                onClick={() => toggleField(outcome.field.id)}
                                aria-label={'Remove ' + outcome.field.crop}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="harvest-plan-empty">
                            <strong>Awaiting field selection</strong>
                            <span>
                              {index + 1 > mission.exposureAfterSlots
                                ? mission.weatherName + ' window'
                                : 'Choose a plot to fill this slot'}
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  },
                )}
              </ol>

              <div className="harvest-score-preview" aria-live="polite">
                <div>
                  <span>Projected operation score</span>
                  <strong>
                    {plan.length ? projectedScore : '—'}
                    <small>{plan.length ? ' pts' : ''}</small>
                  </strong>
                </div>
                <span>
                  {plan.length === 0
                    ? 'Your score updates as you select and reorder fields.'
                    : planIsComplete
                      ? 'Gold standard: ' + mission.goldScore + ' points.'
                      : HARVEST_RUSH_RULES.harvestSlots -
                        plan.length +
                        ' more field' +
                        (HARVEST_RUSH_RULES.harvestSlots - plan.length === 1
                          ? ''
                          : 's') +
                        ' required.'}
                </span>
              </div>

              <div className="harvest-dispatch-actions">
                <button
                  type="button"
                  className="harvest-primary-button"
                  onClick={dispatchHarvest}
                  disabled={!planIsComplete}
                >
                  Dispatch harvest <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className="harvest-secondary-button"
                  onClick={() => setPlan([])}
                  disabled={plan.length === 0}
                >
                  Clear plan
                </button>
              </div>
            </aside>
          </div>
        </>
      )}

      {result && (
        <section
          className="harvest-result-screen"
          aria-labelledby="harvest-result-title"
          aria-live="polite"
        >
          <div className="harvest-result-primary">
            <div className="harvest-result-grade-mark">
              <span>{result.stars ? '★'.repeat(result.stars) : '—'}</span>
              <small>
                {result.grade === 'Gold'
                  ? 'EXCELLENT OPERATION'
                  : result.grade === 'Silver'
                    ? 'STRONG OPERATION'
                    : result.grade === 'Bronze'
                      ? 'OPERATION COMPLETE'
                      : 'ROOM TO IMPROVE'}
              </small>
            </div>
            <div className="harvest-result-score-block">
              <span className="harvest-section-kicker">
                FINAL HARVEST SCORE
              </span>
              <strong>
                {result.score}
                <small> / {result.baseScore} pts</small>
              </strong>
              <span>{result.lostPoints} points lost to weather exposure</span>
            </div>
          </div>
          <div className="harvest-result-detail">
            <div className="harvest-result-heading">
              <span className="harvest-section-kicker">
                AFTER-ACTION REPORT / MISSION {mission.number}
              </span>
              <h3 id="harvest-result-title">
                {result.grade === 'Gold'
                  ? 'You managed the operation well.'
                  : result.grade === 'Developing'
                    ? 'This plan did not meet the mission standard.'
                    : 'Mission complete.'}
              </h3>
              <p>
                {result.grade === 'Gold'
                  ? 'Your team balanced crop value, timing, and available resources. ' +
                    'This mission is cleared.'
                  : result.grade === 'Developing'
                    ? 'Your score is below the bronze target. Rework the crop mix or ' +
                      'harvest order and dispatch again. Earn Bronze or better to ' +
                      'unlock the next mission.'
                    : 'You cleared the mission. Review where weather reduced your ' +
                      'return, then try a different field order or crop mix.'}
              </p>
            </div>
            <div className="harvest-result-breakdown">
              {result.outcomes.map((outcome) => (
                <div key={outcome.field.id} className="harvest-result-row">
                  <span className="harvest-result-row-number">
                    0{outcome.slot}
                  </span>
                  <span className="harvest-result-row-name">
                    {outcome.field.crop}
                  </span>
                  <span className="harvest-result-row-condition">
                    {outcome.weatherAffected
                      ? mission.weatherName +
                        ' · −' +
                        outcome.lostPoints +
                        ' pts'
                      : outcome.slot > mission.exposureAfterSlots
                        ? 'Weather resilient'
                        : 'Harvested in clear window'}
                  </span>
                  <strong>+{outcome.score}</strong>
                </div>
              ))}
            </div>
            <p className="harvest-result-record">
              Personal best: {completionBest ?? result.score} · Gold target:{' '}
              {mission.goldScore} pts · Campaign: {progress.completed.length}/3
              cleared
            </p>
            <div className="harvest-result-actions">
              <button
                type="button"
                className="harvest-primary-button"
                onClick={() => nextMission && selectMission(nextMission.id)}
                disabled={!nextMission || !nextMissionUnlocked}
              >
                {nextMission
                  ? nextMissionUnlocked
                    ? 'Continue to next mission'
                    : 'Earn Bronze to unlock next'
                  : 'Campaign complete'}
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="harvest-secondary-button"
                onClick={replayMission}
              >
                Replay mission
              </button>
              <button
                type="button"
                className="harvest-text-button"
                onClick={returnToBriefing}
              >
                Return to briefing
              </button>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
