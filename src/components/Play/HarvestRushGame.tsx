'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  evaluateHarvestPlan,
  getFieldAvailability,
  getHarvestMetrics,
  HARVEST_FIELDS,
  HARVEST_RUSH_RULES,
  previewHarvestPlan,
  type HarvestFieldId,
  type HarvestResult,
} from '@/lib/harvest-rush';

const BEST_SCORE_KEY = 'mohammerd.harvest-rush.best.v1';

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
    <div className="harvest-metric">
      <span className="harvest-metric-label">{label}</span>
      <strong className="harvest-metric-value">{value}</strong>
      <span className="harvest-metric-detail">{detail}</span>
    </div>
  );
}

function moveItem(
  fieldIds: HarvestFieldId[],
  fieldId: HarvestFieldId,
  direction: -1 | 1,
): HarvestFieldId[] {
  const from = fieldIds.indexOf(fieldId);
  const to = from + direction;

  if (from < 0 || to < 0 || to >= fieldIds.length) {
    return fieldIds;
  }

  const next = [...fieldIds];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export default function HarvestRushGame() {
  const [plan, setPlan] = useState<HarvestFieldId[]>([]);
  const [result, setResult] = useState<HarvestResult | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const metrics = useMemo(() => getHarvestMetrics(plan), [plan]);
  const preview = useMemo(() => previewHarvestPlan(plan), [plan]);
  const projectedScore = preview.reduce(
    (total, outcome) => total + outcome.score,
    0,
  );
  const planIsComplete = plan.length === HARVEST_RUSH_RULES.harvestSlots;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(BEST_SCORE_KEY);
      const parsed = stored === null ? null : Number(stored);

      if (parsed !== null && Number.isFinite(parsed) && parsed >= 0) {
        setBestScore(parsed);
      }
    } catch {
      // The game remains fully playable when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!result || (bestScore !== null && result.score <= bestScore)) {
      return;
    }

    setBestScore(result.score);
    try {
      window.localStorage.setItem(BEST_SCORE_KEY, String(result.score));
    } catch {
      // A failed personal-best save must not interrupt the result screen.
    }
  }, [bestScore, result]);

  function addField(fieldId: HarvestFieldId) {
    if (result || getFieldAvailability(plan, fieldId)) {
      return;
    }
    setPlan((current) => [...current, fieldId]);
  }

  function removeField(fieldId: HarvestFieldId) {
    if (result) {
      return;
    }
    setPlan((current) => current.filter((id) => id !== fieldId));
  }

  function reorderField(fieldId: HarvestFieldId, direction: -1 | 1) {
    if (result) {
      return;
    }
    setPlan((current) => moveItem(current, fieldId, direction));
  }

  function dispatchHarvest() {
    if (!planIsComplete || result) {
      return;
    }
    setResult(evaluateHarvestPlan(plan));
  }

  function resetRun() {
    setPlan([]);
    setResult(null);
  }

  return (
    <section className="harvest-game" aria-label="Harvest Rush game">
      <div className="harvest-console">
        <div className="harvest-console-topline">
          <span className="harvest-console-code">MISSION 01 / FIELD OPERATIONS</span>
          <span className="harvest-weather">
            <span className="harvest-weather-indicator" aria-hidden="true" />
            Storm forecast · rain after slot 02
          </span>
        </div>
        <div className="harvest-console-main">
          <div>
            <p className="harvest-console-kicker">THE APPROACHING STORM</p>
            <h2 className="harvest-console-title">Plan the harvest.</h2>
            <p className="harvest-console-copy">
              Choose three fields, keep within the crew and truck limits, and
              protect vulnerable crops before the rain arrives.
            </p>
          </div>
          <div className="harvest-console-metrics" aria-label="Available resources">
            <Metric
              label="Harvest slots"
              value={metrics.slots + '/' + HARVEST_RUSH_RULES.harvestSlots}
              detail="Field selections"
            />
            <Metric
              label="Crew"
              value={metrics.crew + '/' + HARVEST_RUSH_RULES.crewLimit}
              detail="Work units"
            />
            <Metric
              label="Truck"
              value={metrics.crates + '/' + HARVEST_RUSH_RULES.truckCapacity}
              detail="Crate capacity"
            />
          </div>
        </div>
      </div>

      <div className="harvest-game-instructions">
        <span className="harvest-instruction-number">01</span>
        <p>
          Select three fields. Your first two harvests happen in clear weather;
          the third happens after the storm arrives. You can change the order
          before dispatch.
        </p>
      </div>

      <div className="harvest-game-layout">
        <section className="harvest-fields-section" aria-labelledby="harvest-fields-title">
          <div className="harvest-section-heading">
            <div>
              <span className="harvest-section-index">FIELD REGISTER / 05 PLOTS</span>
              <h3 id="harvest-fields-title">Available fields</h3>
            </div>
            <span className="harvest-section-count">
              {HARVEST_FIELDS.length} plots
            </span>
          </div>

          <div className="harvest-field-grid">
            {HARVEST_FIELDS.map((field) => {
              const selectedAt = plan.indexOf(field.id);
              const availability = getFieldAvailability(plan, field.id);
              const selected = selectedAt >= 0;
              const disabled = Boolean(availability) || Boolean(result);

              return (
                <button
                  key={field.id}
                  type="button"
                  className={
                    'harvest-field ' +
                    (selected ? 'harvest-field-selected' : '')
                  }
                  onClick={() => addField(field.id)}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={
                    field.crop +
                    ', ' +
                    field.crates +
                    ' crates, ' +
                    field.crew +
                    ' crew, ' +
                    field.fieldNote +
                    (selected ? ', slot ' + (selectedAt + 1) : '')
                  }
                >
                  <span className="harvest-field-graphic" aria-hidden="true">
                    <span className="harvest-field-graphic-lines" />
                    <span className="harvest-field-number">{field.number}</span>
                  </span>
                  <span className="harvest-field-content">
                    <span className="harvest-field-topline">
                      <span className="harvest-field-code">
                        PLOT {field.number}
                      </span>
                      <span className="harvest-field-status">
                        {selected
                          ? 'IN SLOT 0' + (selectedAt + 1)
                          : availability || 'AVAILABLE'}
                      </span>
                    </span>
                    <span className="harvest-field-name">{field.crop}</span>
                    <span className="harvest-field-description">
                      {field.description}
                    </span>
                    <span className="harvest-field-data">
                      <span>
                        <strong>{field.crates}</strong> crates
                      </span>
                      <span>
                        <strong>{field.crew}</strong> crew
                      </span>
                      <span>
                        <strong>{field.crates * field.pointsPerCrate}</strong> pts
                      </span>
                    </span>
                    <span
                      className={
                        'harvest-field-risk ' +
                        (field.rainLoss > 0
                          ? 'harvest-field-risk-sensitive'
                          : '')
                      }
                    >
                      {field.fieldNote}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="harvest-plan-panel" aria-labelledby="harvest-plan-title">
          <div className="harvest-section-heading">
            <div>
              <span className="harvest-section-index">DISPATCH QUEUE / 03 SLOTS</span>
              <h3 id="harvest-plan-title">Your harvest plan</h3>
            </div>
            <span className="harvest-section-count">
              {plan.length}/{HARVEST_RUSH_RULES.harvestSlots}
            </span>
          </div>

          <ol className="harvest-plan-list">
            {Array.from({ length: HARVEST_RUSH_RULES.harvestSlots }, (_, index) => {
              const outcome = preview[index];

              return (
                <li
                  key={index}
                  className={
                    'harvest-plan-slot ' +
                    (outcome?.rainAffected ? 'harvest-plan-slot-exposed' : '')
                  }
                >
                  <span className="harvest-plan-slot-number">
                    0{index + 1}
                  </span>
                  {outcome ? (
                    <div className="harvest-plan-slot-content">
                      <div className="harvest-plan-slot-main">
                        <div>
                          <strong>{outcome.field.crop}</strong>
                          <span>
                            {outcome.field.crates} crates · {outcome.field.crew}{' '}
                            crew
                          </span>
                        </div>
                        <strong className="harvest-plan-score">
                          {outcome.score} pts
                        </strong>
                      </div>
                      <div className="harvest-plan-slot-actions">
                        <span className="harvest-plan-weather-note">
                          {outcome.rainAffected
                            ? 'Rain loss · −' + outcome.lostPoints + ' pts'
                            : index === 2
                              ? 'After rain · protected'
                              : 'Clear weather'}
                        </span>
                        {!result && (
                          <div className="harvest-plan-controls">
                            <button
                              type="button"
                              className="harvest-icon-button"
                              onClick={() => reorderField(outcome.field.id, -1)}
                              disabled={index === 0}
                              aria-label={
                                'Move ' + outcome.field.crop + ' earlier'
                              }
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="harvest-icon-button"
                              onClick={() => reorderField(outcome.field.id, 1)}
                              disabled={index === plan.length - 1}
                              aria-label={
                                'Move ' + outcome.field.crop + ' later'
                              }
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="harvest-remove-button"
                              onClick={() => removeField(outcome.field.id)}
                              aria-label={
                                'Remove ' + outcome.field.crop + ' from plan'
                              }
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="harvest-plan-empty">
                      <strong>Slot awaiting field</strong>
                      <span>
                        {index === 2
                          ? 'The storm will have arrived'
                          : 'Choose a plot from the register'}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="harvest-plan-summary">
            <div>
              <span>Projected harvest score</span>
              <strong>
                {plan.length > 0 ? projectedScore : '—'}
                {plan.length > 0 && <small> pts</small>}
              </strong>
            </div>
            <p>
              {plan.length === 0
                ? 'Your score preview will appear as you build the plan.'
                : planIsComplete
                  ? 'Gold target: ' +
                    HARVEST_RUSH_RULES.goldScore +
                    ' points. Dispatch when your order is ready.'
                  : 'Select ' +
                    (HARVEST_RUSH_RULES.harvestSlots - plan.length) +
                    ' more field' +
                    (HARVEST_RUSH_RULES.harvestSlots - plan.length === 1
                      ? ''
                      : 's') +
                    ' to complete the plan.'}
            </p>
          </div>

          {result ? (
            <div
              className={
                'harvest-result harvest-result-' +
                result.grade.toLowerCase().replaceAll(' ', '-')
              }
              aria-live="polite"
            >
              <span className="harvest-result-kicker">MISSION COMPLETE</span>
              <div className="harvest-result-heading">
                <div>
                  <span className="harvest-result-grade">{result.grade}</span>
                  <strong className="harvest-result-score">{result.score}</strong>
                  <span className="harvest-result-unit">points earned</span>
                </div>
                <span className="harvest-result-best">
                  Personal best
                  <strong>{bestScore ?? result.score}</strong>
                </span>
              </div>
              <p className="harvest-result-copy">
                {result.score >= HARVEST_RUSH_RULES.goldScore
                  ? 'Strong operation. You protected vulnerable crops and used the available resources efficiently.'
                  : 'Review the rain losses and resource choices, then adjust the order for another run.'}
              </p>
              <button
                type="button"
                className="harvest-primary-button"
                onClick={resetRun}
              >
                Run mission again <span aria-hidden="true">↻</span>
              </button>
            </div>
          ) : (
            <div className="harvest-plan-actions">
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
                onClick={resetRun}
                disabled={plan.length === 0}
              >
                Clear plan
              </button>
            </div>
          )}
        </aside>
      </div>

      {result && (
        <section className="harvest-debrief" aria-labelledby="harvest-debrief-title">
          <div className="harvest-section-heading">
            <div>
              <span className="harvest-section-index">AFTER-ACTION REPORT</span>
              <h3 id="harvest-debrief-title">What happened in the field</h3>
            </div>
            <span className="harvest-section-count">
              {result.outcomes.length} harvests
            </span>
          </div>
          <ol className="harvest-debrief-list">
            {result.outcomes.map((outcome) => (
              <li key={outcome.field.id}>
                <span className="harvest-debrief-slot">0{outcome.slot}</span>
                <span className="harvest-debrief-crop">{outcome.field.crop}</span>
                <span className="harvest-debrief-condition">
                  {outcome.rainAffected
                    ? 'Rain reduced the score by ' +
                      outcome.lostPoints +
                      ' points'
                    : outcome.slot === 3
                      ? 'Weather-safe crop; no quality loss'
                      : 'Harvested before the rain'}
                </span>
                <strong>+{outcome.score}</strong>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="harvest-game-footnote">
        Game values are simplified for play and are not agricultural or market
        guidance. Your personal best is saved on this device only.
      </p>
    </section>
  );
}
