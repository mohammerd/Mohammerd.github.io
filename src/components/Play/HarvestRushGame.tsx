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
  previewHarvestPlan,
  type HarvestFieldId,
  type HarvestMissionId,
  type HarvestResult,
  type WeatherType,
} from '@/lib/harvest-rush';

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
    if (!raw) return EMPTY_PROGRESS;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_PROGRESS;

    const candidate = parsed as Partial<PlayerProgress>;
    const validIds = HARVEST_MISSIONS.map((mission) => mission.id);
    const completed = Array.isArray(candidate.completed)
      ? candidate.completed.filter(
          (id): id is HarvestMissionId =>
            typeof id === 'string' &&
            validIds.includes(id as HarvestMissionId),
        )
      : [];
    const bestScores: PlayerProgress['bestScores'] = {};

    if (
      candidate.bestScores &&
      typeof candidate.bestScores === 'object'
    ) {
      for (const id of validIds) {
        const score = candidate.bestScores[id];
        if (typeof score === 'number' && Number.isFinite(score) && score >= 0) {
          bestScores[id] = score;
        }
      }
    }

    return {
      bestScores,
      completed: [...new Set(completed)],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function CropArt({ fieldId }: { fieldId: HarvestFieldId }) {
  const common = {
    viewBox: '0 0 100 100',
    role: 'img' as const,
    'aria-hidden': true as const,
  };

  switch (fieldId) {
    case 'tomatoes':
      return (
        <svg {...common}>
          <path d="M50 27c-8-14-21-13-27-5 12 1 18 7 20 15" fill="#477c56" />
          <path d="M51 28c6-17 20-18 28-10-12 2-19 9-22 19" fill="#477c56" />
          <path d="M50 30c-5-9-2-16 1-22 6 9 7 16 2 23" fill="#6c965d" />
          <path d="M50 28v12" stroke="#477c56" strokeWidth="4" strokeLinecap="round" />
          <circle cx="37" cy="57" r="20" fill="#c65b45" />
          <circle cx="64" cy="59" r="19" fill="#d97455" />
          <path d="M31 43l6-3 5 5m17-1 6-3 5 5" fill="none" stroke="#f4b29a" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'peppers':
      return (
        <svg {...common}>
          <path d="M49 25c3-10 11-13 20-11-3 8-9 13-18 15" fill="#6c965d" />
          <path d="M49 28c-2-7-1-13 2-19" stroke="#477c56" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 32c-7-7-17-7-23-2-8 8-4 28 2 42 4 9 10 13 17 11 5-1 7-8 7-15 1 9 6 16 13 14 10-3 17-24 14-38-2-11-12-17-23-12-3 1-5 3-7 6z" fill="#4d8a66" />
          <path d="M50 38c-3 15-2 29 0 41" fill="none" stroke="#a9c18d" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'maize':
      return (
        <svg {...common}>
          <path d="M49 15c-14 13-20 33-14 62 12-5 19-22 18-44" fill="#6f985f" />
          <path d="M52 18c18 13 25 34 17 62-12-7-19-24-17-46" fill="#477c56" />
          <path d="M50 22c-9 8-12 24-10 43 8 7 14 7 21 0 2-19-1-35-11-43z" fill="#e1b54c" />
          {Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 3 }, (_, col) => (
              <ellipse
                key={row + '-' + col}
                cx={43 + col * 7 + (row % 2) * 2}
                cy={32 + row * 8}
                rx="2.2"
                ry="3"
                fill="#f7d77b"
              />
            )),
          )}
          <path d="M50 19c-3-7-2-11 1-16" stroke="#477c56" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'cassava':
      return (
        <svg {...common}>
          <path d="M49 29c-13-14-24-13-31-6 13 0 20 8 24 18m9-14c9-18 21-19 29-13-12 4-17 11-19 21" fill="#638a59" />
          <path d="M49 32c-5-12-2-20 2-26 5 9 6 17 2 28" fill="#88a76b" />
          <path d="M47 41c-5 6-7 17-5 29 2 8 8 14 11 18 5-8 7-16 4-26-2-9-5-16-10-21z" fill="#b88d59" />
          <path d="M55 43c5 7 8 17 6 28-1 8-5 14-8 18-5-8-7-17-4-27 1-8 3-15 6-19z" fill="#d0a66f" />
          <path d="M39 56l7 2m-4 9 9 1m-1 12 7-2m-1-25 8 3" stroke="#f1d4a3" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'okra':
      return (
        <svg {...common}>
          <path d="M50 27c-8-14-19-15-28-8 12 2 18 8 20 17m10-9c8-14 19-15 28-8-12 2-18 8-20 17" fill="#6c965d" />
          <path d="M48 31c-3-8-2-15 2-23 5 10 5 16 2 24" fill="#477c56" />
          <path d="M41 35c-10 1-16 10-15 23 1 13 9 27 17 33 5-9 8-24 6-38-1-10-3-16-8-18z" fill="#6c9564" />
          <path d="M60 34c9 1 15 10 14 23-1 13-8 27-16 33-6-9-9-24-7-38 1-10 4-16 9-18z" fill="#7ca16d" />
          <path d="M42 43l-3 34m20-34 3 34" stroke="#bdd09e" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 48l-4 4m17-4 4 4m-18 7 4 4m9-4-4 4" stroke="#d5e0bb" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

function WeatherMark({ weather }: { weather: WeatherType }) {
  if (weather === 'rain') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M11 26h26a8 8 0 0 0 0-16 12 12 0 0 0-22-1 9 9 0 0 0-4 17z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m17 33-3 6m12-6-3 6m12-6-3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (weather === 'heat') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="21" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M24 3v5m0 26v5M6 21h5m26 0h5M11 8l4 4m18 18 4 4m0-26-4 4m-18 18-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 43c2-3 4-3 6 0m4 0c2-3 4-3 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M5 17c7-6 12 6 19 0s12 6 19 0M5 26c7-6 12 6 19 0s12 6 19 0M9 35c5-4 9 4 14 0s9 4 14 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="15" cy="10" r="1.6" fill="currentColor" />
      <circle cx="32" cy="7" r="1.4" fill="currentColor" />
      <circle cx="27" cy="39" r="1.4" fill="currentColor" />
    </svg>
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
  const tone = ratio >= 90 ? 'is-near-limit' : ratio >= 70 ? 'is-mid-limit' : '';

  return (
    <div className={'harvest-resource ' + tone}>
      <div className="harvest-resource-heading">
        <span>{label}</span>
        <strong>
          {used}<small> / {limit} {unit}</small>
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
    <div className="harvest-weather-timeline" aria-label="Weather timeline">
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
            <span className="harvest-weather-step-marker" aria-hidden="true" />
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
          {completed.length} <small>of {HARVEST_MISSIONS.length} missions cleared</small>
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
        <span style={{ width: (completed.length / HARVEST_MISSIONS.length) * 100 + '%' }} />
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
              (isCompleted ? ', completed' : '') +
              (!isUnlocked ? ', locked' : '')
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
  const unlockedCount = Math.min(
    HARVEST_MISSIONS.length,
    1 + progress.completed.length,
  );
  const bestScore = progress.bestScores[selectedMissionId] ?? null;
  const nextMission =
    HARVEST_MISSIONS[missionIndex + 1] ?? null;
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
    const index = HARVEST_MISSIONS.findIndex((candidate) => candidate.id === id);
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
        completed: current.completed.includes(selectedMissionId)
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
            <svg viewBox="0 0 36 36">
              <path d="M18 29V17m0 5c-8 0-12-5-12-12 8 0 12 4 12 12zm0-3c0-8 5-13 13-13 0 8-5 13-13 13z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
              <span className="harvest-objective-icon" aria-hidden="true">!</span>
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
              <strong>{mission.goldScore}<small> pts</small></strong>
              <span className="harvest-target-note">Three-star operation</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'planning' && !result && (
        <>
          <div className="harvest-stage-guide">
            <div className="harvest-stage is-current">
              <span>01</span>
              <div><strong>Select fields</strong><small>Build your load</small></div>
            </div>
            <span className="harvest-stage-line" />
            <div className="harvest-stage">
              <span>02</span>
              <div><strong>Sequence the work</strong><small>Protect crop quality</small></div>
            </div>
            <span className="harvest-stage-line" />
            <div className="harvest-stage">
              <span>03</span>
              <div><strong>Dispatch</strong><small>Review the result</small></div>
            </div>
            <button
              type="button"
              className="harvest-brief-link"
              onClick={returnToBriefing}
            >
              View briefing
            </button>
          </div>

          <div className="harvest-planning-layout">
            <section className="harvest-fields-section" aria-labelledby="harvest-fields-title">
              <div className="harvest-section-heading">
                <div>
                  <span className="harvest-section-kicker">FIELD REGISTER / 05 PLOTS</span>
                  <h3 id="harvest-fields-title">Choose your fields</h3>
                  <p>Select up to three plots. Tap a selected plot to remove it.</p>
                </div>
                <span className="harvest-selection-count">
                  {plan.length}<small> / 03</small>
                </span>
              </div>

              <div className="harvest-field-grid">
                {HARVEST_FIELDS.map((field) => {
                  const selectedAt = plan.indexOf(field.id);
                  const selected = selectedAt >= 0;
                  const availability = getFieldAvailability(plan, field.id, mission);
                  const disabled = Boolean(result) || (!selected && Boolean(availability));
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
                        (selected ? ', selected in slot ' + (selectedAt + 1) : '')
                      }
                    >
                      <span className="harvest-field-art">
                        <CropArt fieldId={field.id} />
                        <span className="harvest-field-number">PLOT {field.number}</span>
                        {selected && (
                          <span className="harvest-field-selected-mark" aria-hidden="true">
                            {String(selectedAt + 1).padStart(2, '0')}
                          </span>
                        )}
                      </span>
                      <span className="harvest-field-content">
                        <span className="harvest-field-card-heading">
                          <strong>{field.crop}</strong>
                          <span className={'harvest-risk-tag ' + risk.toLowerCase().replaceAll(' ', '-')}>
                            {risk}
                          </span>
                        </span>
                        <span className="harvest-field-description">{field.description}</span>
                        <span className="harvest-field-stats">
                          <span><strong>{field.crates}</strong> crates</span>
                          <span><strong>{field.crew}</strong> crew</span>
                          <span><strong>{field.crates * field.pointsPerCrate}</strong> base pts</span>
                        </span>
                        {availability && !selected && (
                          <span className="harvest-field-blocked">{availability}</span>
                        )}
                        {selected && (
                          <span className="harvest-field-selected-label">
                            ADDED TO SLOT {String(selectedAt + 1).padStart(2, '0')}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="harvest-field-legend">
                <span><i className="risk-high" /> High exposure</span>
                <span><i className="risk-moderate" /> Moderate exposure</span>
                <span><i className="risk-low" /> Resilient</span>
              </div>
            </section>

            <aside className="harvest-dispatch-panel" aria-labelledby="harvest-plan-title">
              <div className="harvest-dispatch-panel-heading">
                <div>
                  <span className="harvest-section-kicker">LIVE DISPATCH BOARD</span>
                  <h3 id="harvest-plan-title">Your harvest order</h3>
                </div>
                <span className="harvest-dispatch-live"><i /> LIVE PREVIEW</span>
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

              <div className="harvest-weather-sequence">
                <span className="harvest-section-kicker">WEATHER TIMELINE</span>
                <WeatherTimeline mission={mission} />
              </div>

              <ol className="harvest-plan-list">
                {Array.from({ length: HARVEST_RUSH_RULES.harvestSlots }, (_, index) => {
                  const outcome = preview[index];
                  return (
                    <li
                      key={index}
                      className={
                        'harvest-plan-slot' +
                        (outcome?.weatherAffected ? ' is-exposed' : '') +
                        (outcome ? ' has-field' : '')
                      }
                    >
                      <span className="harvest-plan-slot-number">0{index + 1}</span>
                      {outcome ? (
                        <div className="harvest-plan-slot-content">
                          <div className="harvest-plan-slot-main">
                            <span className="harvest-plan-crop-name">{outcome.field.crop}</span>
                            <strong>{outcome.score}<small> pts</small></strong>
                          </div>
                          <div className="harvest-plan-slot-meta">
                            <span>{outcome.field.crates} crates · {outcome.field.crew} crew</span>
                            <span className={outcome.weatherAffected ? 'has-weather-loss' : 'has-weather-clear'}>
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
                              aria-label={'Move ' + outcome.field.crop + ' earlier'}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(outcome.field.id, 1)}
                              disabled={index === plan.length - 1}
                              aria-label={'Move ' + outcome.field.crop + ' later'}
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
                })}
              </ol>

              <div className="harvest-score-preview" aria-live="polite">
                <div>
                  <span>Projected operation score</span>
                  <strong>{plan.length ? projectedScore : '—'}<small>{plan.length ? ' pts' : ''}</small></strong>
                </div>
                <span>
                  {plan.length === 0
                    ? 'Your score updates as you select and reorder fields.'
                    : planIsComplete
                      ? 'Gold standard: ' + mission.goldScore + ' points.'
                      : (HARVEST_RUSH_RULES.harvestSlots - plan.length) + ' more field' + (HARVEST_RUSH_RULES.harvestSlots - plan.length === 1 ? '' : 's') + ' required.'}
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
        <section className="harvest-result-screen" aria-labelledby="harvest-result-title" aria-live="polite">
          <div className="harvest-result-primary">
            <div className="harvest-result-grade-mark">
              <span>{result.stars ? '★'.repeat(result.stars) : '—'}</span>
              <small>{result.grade === 'Gold' ? 'EXCELLENT OPERATION' : result.grade === 'Silver' ? 'STRONG OPERATION' : result.grade === 'Bronze' ? 'OPERATION COMPLETE' : 'ROOM TO IMPROVE'}</small>
            </div>
            <div className="harvest-result-score-block">
              <span className="harvest-section-kicker">FINAL HARVEST SCORE</span>
              <strong>{result.score}<small> / {result.baseScore} pts</small></strong>
              <span>{result.lostPoints} points lost to weather exposure</span>
            </div>
          </div>
          <div className="harvest-result-detail">
            <div className="harvest-result-heading">
              <span className="harvest-section-kicker">AFTER-ACTION REPORT / MISSION {mission.number}</span>
              <h3 id="harvest-result-title">{result.grade === 'Gold' ? 'You managed the operation well.' : 'Review the operation.'}</h3>
              <p>
                {result.grade === 'Gold'
                  ? 'Your team balanced crop value, timing, and available resources. The campaign has recorded this mission as cleared.'
                  : 'The mission is cleared. Review where weather reduced your return, then try a different field order or crop mix.'}
              </p>
            </div>
            <div className="harvest-result-breakdown">
              {result.outcomes.map((outcome) => (
                <div key={outcome.field.id} className="harvest-result-row">
                  <span className="harvest-result-row-number">0{outcome.slot}</span>
                  <span className="harvest-result-row-name">{outcome.field.crop}</span>
                  <span className="harvest-result-row-condition">
                    {outcome.weatherAffected
                      ? mission.weatherName + ' · −' + outcome.lostPoints + ' pts'
                      : outcome.slot > mission.exposureAfterSlots
                        ? 'Weather resilient'
                        : 'Harvested in clear window'}
                  </span>
                  <strong>+{outcome.score}</strong>
                </div>
              ))}
            </div>
            <div className="harvest-result-records">
              <div><span>Personal best</span><strong>{completionBest ?? result.score}</strong></div>
              <div><span>Mission target</span><strong>{mission.goldScore} <small>pts for gold</small></strong></div>
              <div><span>Campaign cleared</span><strong>{progress.completed.length} / 3</strong></div>
            </div>
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
                    : 'Mission cleared'
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

      <div className="harvest-game-footer">
        <span>TACTICAL DECISION GAME / NO ACCOUNT REQUIRED</span>
        <span>
          {progress.completed.length === HARVEST_MISSIONS.length
            ? 'ALL MISSIONS CLEARED'
            : 'PERSONAL PROGRESS SAVED LOCALLY'}
        </span>
      </div>
    </section>
  );
}
