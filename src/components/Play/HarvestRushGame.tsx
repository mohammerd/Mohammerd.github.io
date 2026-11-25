'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';

import {
  advanceFarmDay,
  createInitialFarmState,
  FARM_CROPS,
  FARM_GOAL,
  FARM_SAVE_KEY,
  LEGACY_FARM_SAVE_KEY,
  type FarmCropId,
  type FarmPlot,
  type FarmState,
  getFarmCrop,
  harvestFarmPlot,
  isCropReady,
  isValidFarmState,
  plantFarmCrop,
  tillFarmPlot,
  waterFarmPlot,
} from '@/lib/farm-game';
import { withBasePath } from '@/lib/utils';

type FarmTool = 'hoe' | 'seeds' | 'water' | 'basket';
type Direction = 'up' | 'down' | 'left' | 'right';
type PlayerPosition = { x: number; y: number; direction: Direction };

const FARM_PLOT_POSITIONS = [
  { x: 35.1, y: 29.3 },
  { x: 44.5, y: 29.3 },
  { x: 53.9, y: 29.3 },
  { x: 35.1, y: 48.9 },
  { x: 44.5, y: 48.9 },
  { x: 53.9, y: 48.9 },
] as const;

const FARM_PLOT_CENTERS = FARM_PLOT_POSITIONS.map((position) => ({
  x: position.x + 3.9,
  y: position.y + 7.7,
}));

const FARM_WORK_RANGE = 15;
const STARTING_POSITION: PlayerPosition = {
  x: 63,
  y: 62,
  direction: 'left',
};

const farmWorldStyle = {
  backgroundImage: "url('" + withBasePath('/images/harvest-rush/farm-world.svg') + "')",
} as const;

const TOOL_DETAILS: Record<FarmTool, { label: string; icon: string; key: string }> = {
  hoe: { label: 'Hoe', icon: '⚒', key: '1' },
  seeds: { label: 'Seed bag', icon: '✳', key: '2' },
  water: { label: 'Water', icon: '♧', key: '3' },
  basket: { label: 'Basket', icon: '▧', key: '4' },
};

function normalizeSavedFarm(value: unknown): FarmState {
  if (!value || typeof value !== 'object') return createInitialFarmState();

  const candidate = value as Partial<FarmState>;
  if (!Array.isArray(candidate.plots)) return createInitialFarmState();

  const migrated = {
    ...candidate,
    plots: candidate.plots.map((plot) => {
      if (!plot || typeof plot !== 'object') return plot;
      const savedPlot = plot as FarmPlot & { tilled?: boolean };
      return {
        ...savedPlot,
        tilled:
          typeof savedPlot.tilled === 'boolean'
            ? savedPlot.tilled
            : savedPlot.crop !== null,
      };
    }),
  };

  return isValidFarmState(migrated) ? migrated : createInitialFarmState();
}

function readSavedFarm(): FarmState {
  try {
    const saved =
      window.localStorage.getItem(FARM_SAVE_KEY) ??
      window.localStorage.getItem(LEGACY_FARM_SAVE_KEY);
    if (!saved) return createInitialFarmState();
    return normalizeSavedFarm(JSON.parse(saved) as unknown);
  } catch {
    return createInitialFarmState();
  }
}

function getPlayerDistance(player: PlayerPosition, plotId: number): number {
  const center = FARM_PLOT_CENTERS[plotId - 1];
  if (!center) return Number.POSITIVE_INFINITY;
  // The map is 16:9, so horizontal percentage steps cover more pixels.
  return Math.hypot((player.x - center.x) * (16 / 9), player.y - center.y);
}

function FarmCropSprite({ plot }: { plot: FarmPlot }) {
  if (!plot.crop) return null;

  const crop = getFarmCrop(plot.crop);
  const stage = Math.min(2, Math.ceil((plot.growth / crop.growDays) * 2));
  const ready = isCropReady(plot);

  return (
    <span
      className={
        'farm-plot-sprite is-' + plot.crop + ' is-stage-' + stage + ' ' +
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
  player,
  tool,
  onSelectPlot,
  onMovePlayer,
  onSelectTool,
  onUseTool,
}: {
  plots: FarmPlot[];
  selectedPlotId: number;
  player: PlayerPosition;
  tool: FarmTool;
  onSelectPlot: (plotId: number) => void;
  onMovePlayer: (direction: Direction) => void;
  onSelectTool: (tool: FarmTool) => void;
  onUseTool: () => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const key = event.key.toLowerCase();
    const directionByKey: Record<string, Direction> = {
      arrowup: 'up',
      w: 'up',
      arrowdown: 'down',
      s: 'down',
      arrowleft: 'left',
      a: 'left',
      arrowright: 'right',
      d: 'right',
    };
    const direction = directionByKey[key];

    if (direction) {
      event.preventDefault();
      onMovePlayer(direction);
      return;
    }

    if (key === 'e') {
      event.preventDefault();
      onUseTool();
      return;
    }

    const toolByKey: Record<string, FarmTool> = {
      '1': 'hoe',
      '2': 'seeds',
      '3': 'water',
      '4': 'basket',
    };
    if (toolByKey[key]) {
      event.preventDefault();
      onSelectTool(toolByKey[key]);
    }
  }

  return (
    <div className="farm-world-frame">
      <div
        className="farm-world"
        role="group"
        aria-label="Farm field. Focus this area and use WASD or arrow keys to move the farmer."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={farmWorldStyle}
      >
        {plots.map((plot, index) => {
          const position = FARM_PLOT_POSITIONS[index];
          const crop = plot.crop ? getFarmCrop(plot.crop) : null;
          const ready = isCropReady(plot);
          const selected = plot.id === selectedPlotId;
          const state = ready
            ? ', ready to harvest'
            : crop
              ? ', growing'
              : plot.tilled
                ? ', tilled soil'
                : ', untouched soil';

          return (
            <button
              key={plot.id}
              type="button"
              className={
                'farm-map-plot-button' +
                (selected ? ' is-selected' : '') +
                (crop ? ' is-planted' : '') +
                (plot.tilled ? ' is-tilled' : '')
              }
              style={{
                left: position.x + '%',
                top: position.y + '%',
              }}
              aria-label={
                'Plot ' + plot.id + ': ' + (crop ? crop.name : 'empty') + state
              }
              aria-pressed={selected}
              onClick={() => onSelectPlot(plot.id)}
            >
              {crop ? (
                <FarmCropSprite plot={plot} />
              ) : (
                <span className="farm-plot-empty-mark" aria-hidden="true">
                  {plot.tilled ? '✓' : '+'}
                </span>
              )}
            </button>
          );
        })}
        <div
          className={'farm-player is-facing-' + player.direction}
          style={{ left: player.x + '%', top: player.y + '%' }}
          aria-hidden="true"
        >
          <span className="farm-player-shadow" />
          <span className="farm-player-tool">{TOOL_DETAILS[tool].icon}</span>
          <span className="farm-player-hat" />
          <span className="farm-player-head" />
          <span className="farm-player-body" />
          <span className="farm-player-legs" />
        </div>
        <span className="farm-map-hint">WASD / arrows to walk</span>
      </div>
      <span className="farm-map-caption">
        Walk up to a plot, equip the right tool, then work the soil.
      </span>
    </div>
  );
}

export default function HarvestRushGame() {
  const [farm, setFarm] = useState<FarmState>(createInitialFarmState);
  const [selectedPlotId, setSelectedPlotId] = useState(6);
  const [selectedSeed, setSelectedSeed] = useState<FarmCropId>('tomato');
  const [tool, setTool] = useState<FarmTool>('hoe');
  const [player, setPlayer] = useState<PlayerPosition>(STARTING_POSITION);
  const [notice, setNotice] = useState(
    'Your farm is ready. Walk to a plot and use your hoe to prepare the soil.',
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
  const playerDistance = getPlayerDistance(player, selectedPlotId);
  const playerIsNear = playerDistance <= FARM_WORK_RANGE;
  const growthPercent = plantedCrop
    ? Math.min(100, (selectedPlot.growth / plantedCrop.growDays) * 100)
    : 0;
  const plantedCount = farm.plots.filter((plot) => plot.crop !== null).length;
  const readyCount = farm.plots.filter(isCropReady).length;
  const goalProgress = Math.min(farm.harvested, FARM_GOAL);

  function selectPlot(plotId: number) {
    setSelectedPlotId(plotId);
    const plot = farm.plots.find((candidate) => candidate.id === plotId);
    if (!plot) return;

    if (!plot.crop) {
      setNotice(
        plot.tilled
          ? 'Plot ' + plotId + ' is prepared. Equip your seed bag to plant.'
          : 'Plot ' + plotId + ' needs digging. Walk over and use your hoe.',
      );
      return;
    }

    const crop = getFarmCrop(plot.crop);
    setNotice(
      isCropReady(plot)
        ? crop.name + ' in Plot ' + plotId + ' are ready. Bring your harvest basket.'
        : plot.watered
          ? crop.name + ' in Plot ' + plotId + ' are watered for today.'
          : crop.name + ' in Plot ' + plotId + ' need water before the day ends.',
    );
  }

  function movePlayer(direction: Direction) {
    const horizontal = direction === 'left' ? -3 : direction === 'right' ? 3 : 0;
    const vertical = direction === 'up' ? -5.3 : direction === 'down' ? 5.3 : 0;
    setPlayer((current) => ({
      x: Math.max(8, Math.min(92, current.x + horizontal)),
      y: Math.max(15, Math.min(89, current.y + vertical)),
      direction,
    }));
  }

  function useEquippedTool() {
    if (!playerIsNear) {
      setNotice(
        'Walk closer to Plot ' + selectedPlotId +
          ' before working. Use WASD, arrow keys, or the movement pad.',
      );
      return;
    }

    if (tool === 'hoe') {
      if (selectedPlot.crop) {
        setNotice('There is a crop growing here. Harvest it before preparing the soil again.');
        return;
      }
      const next = tillFarmPlot(farm, selectedPlotId);
      if (next === farm) {
        setNotice('Plot ' + selectedPlotId + ' is already prepared for planting.');
        return;
      }
      setFarm(next);
      setNotice('You turned the soil in Plot ' + selectedPlotId + '. It is ready for seeds.');
      return;
    }

    if (tool === 'seeds') {
      if (!selectedPlot.tilled) {
        setNotice('This soil is hard. Use the hoe before planting seeds.');
        return;
      }
      const next = plantFarmCrop(farm, selectedPlotId, selectedSeed);
      if (next === farm) {
        setNotice(
          farm.coins < selectedCrop.seedCost
            ? 'You need ' + selectedCrop.seedCost + ' coins for ' + selectedCrop.name + ' seeds.'
            : 'This plot already has a crop growing.',
        );
        return;
      }
      setFarm(next);
      setNotice(
        'You planted ' + selectedCrop.name.toLowerCase() + ' in Plot ' +
          selectedPlotId + '. Equip the watering can.',
      );
      return;
    }

    if (tool === 'water') {
      const next = waterFarmPlot(farm, selectedPlotId);
      if (next === farm) {
        setNotice(
          !selectedPlot.crop
            ? 'There is nothing planted here to water.'
            : selectedPlot.watered
              ? 'This plot has already been watered today.'
              : 'This crop is ready. Use your harvest basket.',
        );
        return;
      }
      setFarm(next);
      setNotice('You watered Plot ' + selectedPlotId + '. End the day to grow this crop.');
      return;
    }

    const outcome = harvestFarmPlot(farm, selectedPlotId);
    if (!outcome.crop) {
      setNotice(
        !selectedPlot.crop
          ? 'This plot is empty. Plant a crop before harvesting.'
          : 'The ' + (plantedCrop?.name.toLowerCase() ?? 'crop') +
            ' are not ripe yet. Keep watering them.',
      );
      return;
    }
    setFarm(outcome.state);
    setNotice(
      outcome.goalReward > 0
        ? 'You harvested ' + outcome.crop.name + '. +' + outcome.crop.sellPrice +
          ' coins and a ' + outcome.goalReward + '-coin farm bonus!'
        : 'You harvested ' + outcome.crop.name + '. +' + outcome.crop.sellPrice + ' coins.',
    );
  }

  function endDay() {
    const wateredCount = farm.plots.filter((plot) => plot.watered).length;
    const next = advanceFarmDay(farm);
    setFarm(next);
    setNotice(
      wateredCount > 0
        ? 'Day ' + next.day + ' begins. ' + wateredCount + ' watered ' +
          (wateredCount === 1 ? 'crop has' : 'crops have') + ' grown.'
        : 'Day ' + next.day + ' begins. Dry crops will not grow. Water them before ending the next day.',
    );
  }

  const actionLabel = {
    hoe: 'Dig Plot ' + selectedPlotId,
    seeds: 'Plant ' + selectedCrop.name.toLowerCase(),
    water: 'Water Plot ' + selectedPlotId,
    basket: 'Harvest Plot ' + selectedPlotId,
  }[tool];

  return (
    <section
      className="harvest-game farm-sim"
      aria-label="AgroGuardAI farm simulator"
    >
      <header className="farm-topbar">
        <div className="farm-brand">
          <span className="farm-brand-mark" aria-hidden="true">✦</span>
          <span>
            <strong>AGROGUARDAI</strong>
            <small>FARM SIMULATOR</small>
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
          <p className="farm-eyebrow">YOUR LAND / YOUR WORK</p>
          <h2>Build a working farm.</h2>
          <p>Walk the field, prepare the soil, plant, water and bring in your harvest.</p>
        </div>
        <div className="farm-weather-chip">
          <span className="farm-sun" aria-hidden="true">☀</span>
          <span>
            <strong>Clear skies</strong>
            <small>Daylight on the farm</small>
          </span>
        </div>
      </div>

      <div className="farm-goal">
        <div className="farm-goal-copy">
          <div>
            <span className="farm-eyebrow">FIRST FARM CONTRACT</span>
            <strong>
              {farm.goalComplete ? 'First contract complete!' : 'Grow and harvest 4 crops'}
            </strong>
          </div>
          <span className="farm-goal-count">{goalProgress}/{FARM_GOAL}</span>
        </div>
        <div
          className="farm-goal-track"
          role="progressbar"
          aria-label="First farm contract progress"
          aria-valuemin={0}
          aria-valuemax={FARM_GOAL}
          aria-valuenow={goalProgress}
        >
          <span style={{ width: (goalProgress / FARM_GOAL) * 100 + '%' }} />
        </div>
        <p>
          {farm.goalComplete
            ? 'The 20-coin contract bonus is yours. Keep expanding the farm.'
            : 'Complete the contract to earn a 20-coin bonus.'}
        </p>
      </div>

      <div className="farm-game-layout">
        <div className="farm-map-column">
          <div className="farm-map-heading">
            <div>
              <span className="farm-eyebrow">FIELD VIEW / TOP DOWN</span>
              <strong>Your land and homestead</strong>
            </div>
            <div className="farm-map-stats">
              <span>{readyCount} ready</span>
              <span>{plantedCount} growing</span>
            </div>
          </div>
          <FarmWorld
            plots={farm.plots}
            selectedPlotId={selectedPlotId}
            player={player}
            tool={tool}
            onSelectPlot={selectPlot}
            onMovePlayer={movePlayer}
            onSelectTool={setTool}
            onUseTool={useEquippedTool}
          />
          <div className="farm-movement-controls">
            <div className="farm-movement-copy">
              <strong>Move your farmer</strong>
              <span>WASD or arrow keys when the field is focused</span>
            </div>
            <div className="farm-direction-pad" aria-label="Movement pad">
              <span />
              <button type="button" aria-label="Move north" onClick={() => movePlayer('up')}>↑</button>
              <span />
              <button type="button" aria-label="Move west" onClick={() => movePlayer('left')}>←</button>
              <button type="button" aria-label="Move south" onClick={() => movePlayer('down')}>↓</button>
              <button type="button" aria-label="Move east" onClick={() => movePlayer('right')}>→</button>
            </div>
          </div>
          <div className="farm-legend" aria-label="Map legend">
            <span><i className="is-empty" /> Untouched soil</span>
            <span><i className="is-tilled" /> Prepared soil</span>
            <span><i className="is-growing" /> Growing</span>
            <span><i className="is-ready" /> Ready to harvest</span>
          </div>
        </div>

        <aside className="farm-side-panel" aria-label="Tools and field work">
          <div className="farm-panel-heading">
            <div>
              <span className="farm-eyebrow">
                SELECTED / PLOT {String(selectedPlotId).padStart(2, '0')}
              </span>
              <h3>
                {plantedCrop
                  ? plantedCrop.name
                  : selectedPlot.tilled
                    ? 'Prepared soil'
                    : 'Untouched soil'}
              </h3>
            </div>
            <span
              className={
                selectedReady
                  ? 'farm-state-tag is-ready'
                  : plantedCrop
                    ? 'farm-state-tag is-growing'
                    : selectedPlot.tilled
                      ? 'farm-state-tag is-tilled'
                      : 'farm-state-tag'
              }
            >
              {selectedReady
                ? 'Ripe'
                : plantedCrop
                  ? 'Growing'
                  : selectedPlot.tilled
                    ? 'Prepared'
                    : 'Needs work'}
            </span>
          </div>

          {plantedCrop ? (
            <div className="farm-crop-status">
              <div className={'farm-crop-preview is-' + plantedCrop.id}>
                <span
                  className={
                    'farm-crop-preview-plant is-stage-' +
                    Math.min(2, Math.ceil((selectedPlot.growth / plantedCrop.growDays) * 2))
                  }
                />
              </div>
              <div className="farm-crop-progress-copy">
                <strong>
                  {selectedReady
                    ? 'Crop is ready to pick'
                    : 'Growth · ' + selectedPlot.growth + ' of ' + plantedCrop.growDays + ' days'}
                </strong>
                <span>
                  {selectedReady
                    ? 'Harvest value: ' + plantedCrop.sellPrice + ' coins.'
                    : selectedPlot.watered
                      ? 'Watered today. End the day to grow.'
                      : 'Needs water before the day ends.'}
                </span>
              </div>
              <div
                className="farm-growth-track"
                role="progressbar"
                aria-label={plantedCrop.name + ' growth'}
                aria-valuemin={0}
                aria-valuemax={plantedCrop.growDays}
                aria-valuenow={selectedPlot.growth}
              >
                <span style={{ width: growthPercent + '%' }} />
              </div>
            </div>
          ) : (
            <p className="farm-plot-description">
              {selectedPlot.tilled
                ? 'The soil is prepared. Plant a seed to start growing a crop.'
                : 'This bed has not been worked. Use the hoe to loosen the soil first.'}
            </p>
          )}

          <div className="farm-tool-section">
            <span className="farm-eyebrow">YOUR TOOL BELT</span>
            <div className="farm-toolbelt" role="group" aria-label="Choose a farming tool">
              {(Object.keys(TOOL_DETAILS) as FarmTool[]).map((toolId) => (
                <button
                  key={toolId}
                  type="button"
                  className={tool === toolId ? 'farm-tool-button is-active' : 'farm-tool-button'}
                  aria-label={'Tool: ' + TOOL_DETAILS[toolId].label}
                  aria-pressed={tool === toolId}
                  onClick={() => setTool(toolId)}
                >
                  <span className="farm-tool-icon" aria-hidden="true">{TOOL_DETAILS[toolId].icon}</span>
                  <span>{TOOL_DETAILS[toolId].label}</span>
                  <kbd>{TOOL_DETAILS[toolId].key}</kbd>
                </button>
              ))}
            </div>
          </div>

          {tool === 'seeds' && (
            <label className="farm-seed-select">
              <span>Seed in your hand</span>
              <select
                aria-label="Choose crop seed"
                value={selectedSeed}
                onChange={(event) => setSelectedSeed(event.target.value as FarmCropId)}
              >
                {FARM_CROPS.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name} · {crop.seedCost} coins · {crop.growDays} days
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className={playerIsNear ? 'farm-reach-status is-near' : 'farm-reach-status'}>
            <span className="farm-reach-dot" />
            <span>
              {playerIsNear
                ? 'You are close enough to work this plot.'
                : 'Walk closer to the selected plot to use your tool.'}
            </span>
          </div>

          <button type="button" className="farm-primary-action" onClick={useEquippedTool}>
            <span>{actionLabel}</span>
            <span>Press E / Use tool</span>
          </button>

          <div className="farm-action-divider" />
          <button type="button" className="farm-secondary-action" onClick={endDay}>
            End day <span aria-hidden="true">→</span>
          </button>
          <p className="farm-action-hint">
            The day only advances when you choose to rest. Watered crops grow overnight.
          </p>
        </aside>
      </div>

      <p className="farm-notice" role="status" aria-live="polite">{notice}</p>
      <p className="farm-disclaimer">
        Crop prices and growth times are fictional game rules, not farming or market advice.
        Progress is saved on this device. This is a browser game; no account or backend is used.
      </p>
    </section>
  );
}
