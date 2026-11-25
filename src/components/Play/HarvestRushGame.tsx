'use client';

import { useEffect, useState } from 'react';

import {
  advanceFarmDay,
  createInitialFarmState,
  FARM_CROPS,
  FARM_GOAL,
  FARM_SAVE_KEY,
  type FarmCropId,
  type FarmPlot,
  type FarmState,
  getFarmCrop,
  harvestFarmPlot,
  isCropReady,
  isValidFarmState,
  plantFarmCrop,
  waterFarmPlot,
} from '@/lib/farm-game';
import { withBasePath } from '@/lib/utils';

function readSavedFarm(): FarmState {
  try {
    const raw = window.localStorage.getItem(FARM_SAVE_KEY);
    if (!raw) return createInitialFarmState();
    const parsed: unknown = JSON.parse(raw);
    return isValidFarmState(parsed) ? parsed : createInitialFarmState();
  } catch {
    return createInitialFarmState();
  }
}

const FARM_PLOT_POSITIONS = [
  { x: 35.1, y: 29.3 },
  { x: 44.5, y: 29.3 },
  { x: 53.9, y: 29.3 },
  { x: 35.1, y: 48.9 },
  { x: 44.5, y: 48.9 },
  { x: 53.9, y: 48.9 },
];

const farmWorldStyle = {
  backgroundImage: `url("${withBasePath('/images/harvest-rush/farm-world.svg')}")`,
} as const;

function FarmCropSprite({ plot }: { plot: FarmPlot }) {
  if (!plot.crop) return null;

  const ready = isCropReady(plot);
  return (
    <span
      className={
        `farm-plot-sprite is-${plot.crop} ` +
        (ready ? 'is-ready' : 'is-growing')
      }
      aria-hidden="true"
    >
      <i className="farm-plot-stem" />
      <i className="farm-plot-leaf is-left" />
      <i className="farm-plot-leaf is-right" />
      <i className="farm-plot-leaf is-top" />
      <i className="farm-plot-fruit is-left" />
      <i className="farm-plot-fruit is-right" />
      <i className="farm-plot-fruit is-center" />
    </span>
  );
}

function FarmWorld({
  plots,
  selectedPlotId,
  onSelectPlot,
}: {
  plots: FarmPlot[];
  selectedPlotId: number;
  onSelectPlot: (plotId: number) => void;
}) {
  return (
    <div className="farm-world-frame">
      <div
        className="farm-world"
        role="group"
        aria-label="Top-down farm map. Select one of the six garden plots."
        style={farmWorldStyle}
      >
        {plots.map((plot, index) => {
          const position = FARM_PLOT_POSITIONS[index];
          const crop = plot.crop ? getFarmCrop(plot.crop) : null;
          const ready = isCropReady(plot);
          const selected = plot.id === selectedPlotId;
          const state = ready ? ', ready to harvest' : crop ? ', growing' : '';

          return (
            <button
              key={plot.id}
              type="button"
              className={
                'farm-map-plot-button' +
                (selected ? ' is-selected' : '') +
                (crop ? ' is-planted' : '')
              }
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              aria-label={`Plot ${plot.id}: ${crop ? crop.name : 'empty bed'}${state}`}
              aria-pressed={selected}
              onClick={() => onSelectPlot(plot.id)}
            >
              {crop ? (
                <FarmCropSprite plot={plot} />
              ) : (
                <span className="farm-plot-empty-mark" aria-hidden="true">
                  +
                </span>
              )}
            </button>
          );
        })}
      </div>
      <span className="farm-map-hint">Tap a plot to select it</span>
    </div>
  );
}

function SeedMark({ cropId }: { cropId: FarmCropId }) {
  return (
    <span className={`farm-seed-mark is-${cropId}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function HarvestRushGame() {
  const [farm, setFarm] = useState<FarmState>(createInitialFarmState);
  const [selectedPlotId, setSelectedPlotId] = useState(1);
  const [selectedSeed, setSelectedSeed] = useState<FarmCropId>('tomato');
  const [notice, setNotice] = useState(
    'Welcome to your farm. Select a plot and plant your first seeds.',
  );
  const [saveReady, setSaveReady] = useState(false);

  useEffect(() => {
    setFarm(readSavedFarm());
    setSaveReady(true);
  }, []);

  useEffect(() => {
    if (!saveReady) return;
    try {
      window.localStorage.setItem(FARM_SAVE_KEY, JSON.stringify(farm));
    } catch {
      // The farm remains playable when local storage is unavailable.
    }
  }, [farm, saveReady]);

  const selectedPlot =
    farm.plots.find((plot) => plot.id === selectedPlotId) ?? farm.plots[0];
  const selectedCrop =
    FARM_CROPS.find((crop) => crop.id === selectedSeed) ?? FARM_CROPS[0];
  const plantedCrop = selectedPlot.crop ? getFarmCrop(selectedPlot.crop) : null;
  const selectedReady = isCropReady(selectedPlot);
  const growthPercent = plantedCrop
    ? Math.min(100, (selectedPlot.growth / plantedCrop.growDays) * 100)
    : 0;
  const goalProgress = Math.min(farm.harvested, FARM_GOAL);

  function selectPlot(plotId: number) {
    setSelectedPlotId(plotId);
    const plot = farm.plots.find((candidate) => candidate.id === plotId);
    if (!plot) return;
    if (!plot.crop) {
      setNotice(`Plot ${plotId} is ready. Choose a seed and plant it here.`);
      return;
    }
    const crop = getFarmCrop(plot.crop);
    setNotice(
      isCropReady(plot)
        ? `${crop.name} in Plot ${plotId} are ready to harvest.`
        : plot.watered
          ? `${crop.name} in Plot ${plotId} are watered for today.`
          : `${crop.name} are growing in Plot ${plotId}. ` +
            'Water them before ending the day.',
    );
  }

  function plantSelectedSeed() {
    const next = plantFarmCrop(farm, selectedPlotId, selectedSeed);
    if (next === farm) {
      setNotice(
        farm.coins < selectedCrop.seedCost
          ? `You need ${selectedCrop.seedCost} coins for ${selectedCrop.name} seeds.`
          : 'Choose an empty plot before planting.',
      );
      return;
    }
    setFarm(next);
    setNotice(
      `${selectedCrop.name} planted in Plot ${selectedPlotId}. ` +
        'Water the soil, then end the day to help it grow.',
    );
  }

  function waterSelectedPlot() {
    const next = waterFarmPlot(farm, selectedPlotId);
    if (next === farm) return;
    setFarm(next);
    setNotice(
      `${plantedCrop?.name ?? 'Crop'} watered. End the day to grow it.`,
    );
  }

  function harvestSelectedPlot() {
    const outcome = harvestFarmPlot(farm, selectedPlotId);
    if (!outcome.crop) return;
    setFarm(outcome.state);
    setNotice(
      outcome.goalReward > 0
        ? `You harvested ${outcome.crop.name} and completed the starter goal. ` +
            `+${outcome.crop.sellPrice} coins plus a ${outcome.goalReward}-coin reward!`
        : `You harvested ${outcome.crop.name}. +${outcome.crop.sellPrice} coins.`,
    );
  }

  function endDay() {
    const wateredCount = farm.plots.filter((plot) => plot.watered).length;
    const next = advanceFarmDay(farm);
    setFarm(next);
    setNotice(
      wateredCount > 0
        ? `Day ${next.day} begins. ${wateredCount} watered ` +
            `${wateredCount === 1 ? 'crop has' : 'crops have'} grown.`
        : `Day ${next.day} begins. ` +
            'Water your crops before ending the day so they can grow.',
    );
  }

  const plantedCount = farm.plots.filter((plot) => plot.crop !== null).length;
  const readyCount = farm.plots.filter(isCropReady).length;

  return (
    <section
      className="harvest-game farm-sim"
      aria-label="Harvest Rush farm simulation"
    >
      <header className="farm-topbar">
        <div className="farm-brand">
          <span className="farm-brand-mark" aria-hidden="true">
            ✦
          </span>
          <span>
            <strong>HARVEST RUSH</strong>
            <small>YOUR LITTLE FARM</small>
          </span>
        </div>
        <div className="farm-hud" aria-label="Farm status">
          <div className="farm-hud-item">
            <span>DAY</span>
            <strong>{farm.day}</strong>
          </div>
          <div className="farm-hud-item">
            <span>COINS</span>
            <strong>{farm.coins}</strong>
          </div>
          <div className="farm-hud-item">
            <span>IN THE GROUND</span>
            <strong>{plantedCount}/6</strong>
          </div>
        </div>
      </header>

      <div className="farm-welcome">
        <div>
          <p className="farm-eyebrow">A SMALL PLACE TO GROW</p>
          <h2>Make this farm yours.</h2>
          <p>Plant a few seeds, care for your crops, and sell what you grow.</p>
        </div>
        <div className="farm-weather-chip">
          <span className="farm-sun" aria-hidden="true">
            ☀
          </span>
          <span>
            <strong>Clear skies</strong>
            <small>Good day for the farm</small>
          </span>
        </div>
      </div>

      <div className="farm-goal">
        <div className="farm-goal-copy">
          <div>
            <span className="farm-eyebrow">YOUR FIRST TASK</span>
            <strong>
              {farm.goalComplete ? 'Starter farm complete!' : 'Harvest 4 crops'}
            </strong>
          </div>
          <span className="farm-goal-count">
            {goalProgress}/{FARM_GOAL}
          </span>
        </div>
        <div
          className="farm-goal-track"
          role="progressbar"
          aria-label="Starter goal progress"
          aria-valuemin={0}
          aria-valuemax={FARM_GOAL}
          aria-valuenow={goalProgress}
        >
          <span style={{ width: `${(goalProgress / FARM_GOAL) * 100}%` }} />
        </div>
        <p>
          {farm.goalComplete
            ? 'You earned the 20-coin starter reward. ' +
              'Keep growing and fill the whole farm.'
            : 'Complete the task to earn 20 bonus coins.'}
        </p>
      </div>

      <div className="farm-game-layout">
        <div className="farm-map-column">
          <div className="farm-map-heading">
            <div>
              <span className="farm-eyebrow">YOUR FARM</span>
              <strong>Garden & homestead</strong>
            </div>
            <div className="farm-map-stats">
              <span>{readyCount} ready</span>
              <span>{plantedCount} growing</span>
            </div>
          </div>
          <FarmWorld
            plots={farm.plots}
            selectedPlotId={selectedPlotId}
            onSelectPlot={selectPlot}
          />
          <div className="farm-legend" aria-label="Map legend">
            <span>
              <i className="is-empty" /> Empty plot
            </span>
            <span>
              <i className="is-growing" /> Growing
            </span>
            <span>
              <i className="is-ready" /> Ready to harvest
            </span>
          </div>
        </div>

        <aside className="farm-side-panel" aria-label="Farm actions">
          <div className="farm-panel-heading">
            <div>
              <span className="farm-eyebrow">
                PLOT {String(selectedPlotId).padStart(2, '0')}
              </span>
              <h3>{plantedCrop ? plantedCrop.name : 'Empty garden bed'}</h3>
            </div>
            <span
              className={
                selectedReady
                  ? 'farm-state-tag is-ready'
                  : plantedCrop
                    ? 'farm-state-tag is-growing'
                    : 'farm-state-tag'
              }
            >
              {selectedReady ? 'Ready' : plantedCrop ? 'Growing' : 'Empty'}
            </span>
          </div>

          {plantedCrop ? (
            <div className="farm-crop-status">
              <div className={`farm-crop-preview is-${plantedCrop.id}`}>
                <SeedMark cropId={plantedCrop.id} />
              </div>
              <div className="farm-crop-progress-copy">
                <strong>
                  {selectedReady
                    ? 'Ready to harvest!'
                    : `Growing · Day ${selectedPlot.growth} ` +
                      `of ${plantedCrop.growDays}`}
                </strong>
                <span>
                  {selectedReady
                    ? `Sell this harvest for ${plantedCrop.sellPrice} coins.`
                    : selectedPlot.watered
                      ? 'Watered today. End the day to help it grow.'
                      : 'Give this crop water before you end the day.'}
                </span>
              </div>
              <div
                className="farm-growth-track"
                role="progressbar"
                aria-label={`${plantedCrop.name} growth`}
                aria-valuemin={0}
                aria-valuemax={plantedCrop.growDays}
                aria-valuenow={selectedPlot.growth}
              >
                <span style={{ width: `${growthPercent}%` }} />
              </div>
            </div>
          ) : (
            <div className="farm-seed-picker">
              <p>Choose a seed to plant in Plot {selectedPlotId}.</p>
              <div className="farm-seed-grid">
                {FARM_CROPS.map((crop) => (
                  <button
                    key={crop.id}
                    type="button"
                    className={
                      selectedSeed === crop.id
                        ? 'farm-seed-option is-selected'
                        : 'farm-seed-option'
                    }
                    aria-label={`${crop.name}, ${crop.seedCost} coins, ${crop.growDays} days`}
                    onClick={() => setSelectedSeed(crop.id)}
                    aria-pressed={selectedSeed === crop.id}
                  >
                    <SeedMark cropId={crop.id} />
                    <span className="farm-seed-option-name">{crop.name}</span>
                    <span className="farm-seed-option-meta">
                      {crop.seedCost} coins · {crop.growDays} days
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="farm-primary-action"
                onClick={plantSelectedSeed}
                disabled={farm.coins < selectedCrop.seedCost}
              >
                Plant {selectedCrop.name.toLowerCase()}
                <span>{selectedCrop.seedCost} coins</span>
              </button>
            </div>
          )}

          {plantedCrop && selectedReady && (
            <button
              type="button"
              className="farm-primary-action"
              onClick={harvestSelectedPlot}
            >
              Harvest {plantedCrop.name.toLowerCase()}
              <span>+{plantedCrop.sellPrice} coins</span>
            </button>
          )}
          {plantedCrop && !selectedReady && !selectedPlot.watered && (
            <button
              type="button"
              className="farm-primary-action"
              onClick={waterSelectedPlot}
            >
              Water this crop <span>Free</span>
            </button>
          )}
          {plantedCrop && !selectedReady && selectedPlot.watered && (
            <div className="farm-watered-note">
              <span aria-hidden="true">✓</span>
              This crop is watered for today.
            </div>
          )}

          <div className="farm-action-divider" />
          <button
            type="button"
            className="farm-secondary-action"
            onClick={endDay}
          >
            End day <span aria-hidden="true">→</span>
          </button>
          <p className="farm-action-hint">
            Watered crops grow when you end the day. Dry crops stay the same.
          </p>
        </aside>
      </div>

      <div className="farm-how-to">
        <div className="farm-how-to-heading">
          <div>
            <span className="farm-eyebrow">HOW TO PLAY</span>
            <strong>Four simple steps</strong>
          </div>
          <span className="farm-how-to-progress">No timer · No pressure</span>
        </div>
        <ol>
          <li>
            <span>1</span>
            <strong>Choose a plot</strong>
            <small>Tap any empty soil bed on the map.</small>
          </li>
          <li>
            <span>2</span>
            <strong>Plant a seed</strong>
            <small>Pick a crop you can afford.</small>
          </li>
          <li>
            <span>3</span>
            <strong>Water & rest</strong>
            <small>Water it, then press End day.</small>
          </li>
          <li>
            <span>4</span>
            <strong>Harvest & sell</strong>
            <small>When it is ready, collect your coins.</small>
          </li>
        </ol>
      </div>

      <p className="farm-notice" role="status" aria-live="polite">
        {notice}
      </p>
      <p className="farm-disclaimer">
        Crop prices and growing times are fictional game rules, not farming or
        market advice. Your progress is saved on this device.
      </p>
    </section>
  );
}
