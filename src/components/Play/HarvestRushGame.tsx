'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';

import {
  advanceFarmDay,
  createInitialFarmState,
  FARM_CROPS,
  FARM_GOAL,
  FARM_SAVE_KEY,
  getFarmCrop,
  harvestFarmPlot,
  isCropReady,
  isValidFarmState,
  plantFarmCrop,
  waterFarmPlot,
  type FarmCropId,
  type FarmPlot,
  type FarmState,
} from '@/lib/farm-game';

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

function CropPixels({
  plot,
  x,
  y,
}: {
  plot: FarmPlot;
  x: number;
  y: number;
}) {
  if (!plot.crop) return null;

  const crop = getFarmCrop(plot.crop);
  const ready = isCropReady(plot);
  const growing = plot.growth > 0;
  const leaf = plot.crop === 'maize' ? '#9bc94f' : '#5fbd58';
  const darkLeaf = plot.crop === 'maize' ? '#548c3d' : '#327a42';

  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      <rect x="35" y="49" width="8" height="22" fill="#4b7138" />
      <rect x="18" y="35" width="18" height="9" fill={darkLeaf} />
      <rect x="43" y="27" width="19" height="10" fill={leaf} />
      <rect x="25" y="22" width="12" height="13" fill={leaf} />
      <rect x="44" y="15" width="12" height="14" fill={darkLeaf} />
      {growing && (
        <>
          <rect x="8" y="40" width="20" height="8" fill={leaf} />
          <rect x="51" y="39" width="18" height="8" fill={darkLeaf} />
          <rect x="29" y="9" width="10" height="13" fill={leaf} />
        </>
      )}
      {ready && plot.crop === 'tomato' && (
        <>
          <rect x="10" y="31" width="10" height="10" fill="#db5346" />
          <rect x="55" y="24" width="11" height="11" fill="#e65d4d" />
          <rect x="33" y="3" width="11" height="10" fill="#d94d43" />
          <rect x="12" y="31" width="4" height="3" fill="#f28a64" />
        </>
      )}
      {ready && plot.crop === 'pepper' && (
        <>
          <rect x="15" y="37" width="9" height="15" fill="#d95a3d" />
          <rect x="51" y="25" width="10" height="15" fill="#e05f3d" />
          <rect x="34" y="1" width="11" height="16" fill="#d64b38" />
        </>
      )}
      {ready && plot.crop === 'maize' && (
        <>
          <rect x="12" y="35" width="13" height="12" fill="#e9c75a" />
          <rect x="53" y="23" width="12" height="13" fill="#f0d46c" />
          <rect x="35" y="4" width="12" height="13" fill="#e6c04b" />
        </>
      )}
      {ready && plot.crop === 'okra' && (
        <>
          <rect x="14" y="32" width="8" height="18" fill="#78b553" />
          <rect x="53" y="24" width="8" height="17" fill="#83bd58" />
          <rect x="34" y="1" width="9" height="18" fill="#70a94e" />
        </>
      )}
      <rect x="36" y="70" width="6" height="3" fill="#a6c46d" />
      <title>{crop.name}{ready ? ', ready to harvest' : ''}</title>
    </g>
  );
}

function FarmTree({ x, y, fruit = false }: { x: number; y: number; fruit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      <ellipse cx="27" cy="67" rx="25" ry="7" fill="#315b35" opacity=".35" />
      <rect x="22" y="35" width="11" height="35" fill="#80532f" />
      <rect x="12" y="23" width="29" height="30" fill="#387844" />
      <rect x="6" y="31" width="17" height="17" fill="#4d9650" />
      <rect x="30" y="13" width="22" height="24" fill="#5ca34f" />
      <rect x="17" y="7" width="22" height="25" fill="#478b45" />
      {fruit && (
        <>
          <rect x="13" y="29" width="8" height="8" fill="#d94c3f" />
          <rect x="36" y="21" width="8" height="8" fill="#d94c3f" />
          <rect x="25" y="11" width="8" height="8" fill="#e65a42" />
        </>
      )}
    </g>
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
  const locations = [
    { x: 337, y: 158 },
    { x: 427, y: 158 },
    { x: 517, y: 158 },
    { x: 337, y: 264 },
    { x: 427, y: 264 },
    { x: 517, y: 264 },
  ];

  function handlePlotKeyDown(
    event: KeyboardEvent<SVGGElement>,
    plotId: number,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectPlot(plotId);
    }
  }

  return (
    <div className="farm-world-frame">
      <svg
        className="farm-world"
        viewBox="0 0 960 540"
        role="group"
        aria-label="Top-down farm map. Select one of the six garden plots."
        shapeRendering="crispEdges"
      >
        <defs>
          <pattern id="farm-grass" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" fill="#6d9a4d" />
            <rect x="5" y="8" width="7" height="4" fill="#82a957" />
            <rect x="29" y="5" width="4" height="8" fill="#5d8944" />
            <rect x="17" y="29" width="8" height="4" fill="#86aa5a" />
            <rect x="39" y="34" width="5" height="7" fill="#5d8a45" />
          </pattern>
          <pattern id="farm-path" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#c19b69" />
            <rect x="2" y="3" width="15" height="10" fill="#d5b27d" />
            <rect x="22" y="4" width="14" height="8" fill="#ac8457" />
            <rect x="10" y="23" width="17" height="12" fill="#d0aa75" />
            <rect x="31" y="26" width="7" height="8" fill="#ae875a" />
          </pattern>
          <pattern id="farm-roof" width="30" height="20" patternUnits="userSpaceOnUse">
            <rect width="30" height="20" fill="#397c65" />
            <rect x="2" y="2" width="11" height="7" fill="#4e9a7b" />
            <rect x="17" y="10" width="11" height="7" fill="#28634f" />
          </pattern>
          <pattern id="farm-water" width="52" height="34" patternUnits="userSpaceOnUse">
            <rect width="52" height="34" fill="#548fae" />
            <rect x="7" y="7" width="16" height="3" fill="#80b2c6" />
            <rect x="31" y="21" width="14" height="3" fill="#3f789d" />
            <rect x="38" y="4" width="7" height="3" fill="#94bed0" />
          </pattern>
        </defs>

        <rect width="960" height="540" fill="url(#farm-grass)" />
        <path d="M270 0V540M690 0V540" stroke="#568348" strokeWidth="4" opacity=".35" />
        <path d="M0 112H960" stroke="#568348" strokeWidth="3" opacity=".35" />

        <path
          d="M250 446H716V116H920"
          fill="none"
          stroke="#9a7950"
          strokeWidth="96"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M250 446H716V116H920"
          fill="none"
          stroke="url(#farm-path)"
          strokeWidth="82"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path d="M291 0V540" stroke="#bd945f" strokeWidth="8" opacity=".75" />

        <g className="farm-fence" shapeRendering="crispEdges">
          <rect x="0" y="22" width="960" height="20" fill="#75482d" />
          {Array.from({ length: 25 }, (_, index) => (
            <g key={index}>
              <rect x={index * 40 + 3} y="16" width="29" height="31" fill="#9b6337" stroke="#593b28" strokeWidth="3" />
              <rect x={index * 40 + 7} y="21" width="21" height="7" fill="#c58b4e" />
              <rect x={index * 40 + 7} y="34" width="21" height="6" fill="#75462d" />
            </g>
          ))}
        </g>

        <FarmTree x={45} y={118} fruit />
        <FarmTree x={165} y={102} fruit />
        <FarmTree x={255} y={75} />
        <g transform="translate(28 230)" shapeRendering="crispEdges">
          <rect x="0" y="17" width="54" height="41" fill="#9f6b3e" />
          <rect x="7" y="7" width="40" height="15" fill="#b7844d" />
          {Array.from({ length: 5 }, (_, index) => (
            <rect key={index} x={index * 10 + 5} y="30" width="6" height="18" fill="#7d5233" />
          ))}
        </g>

        <g transform="translate(52 302)" className="farm-house" shapeRendering="crispEdges">
          <rect x="0" y="51" width="220" height="159" fill="#b88b50" stroke="#64462f" strokeWidth="8" />
          <rect x="13" y="66" width="194" height="132" fill="#d3aa68" />
          <path d="M-15 65L107 -4L236 65V84H-15Z" fill="#285b4b" stroke="#1c453e" strokeWidth="8" />
          <path d="M3 60L107 1L220 60" fill="none" stroke="#57a082" strokeWidth="8" />
          <rect x="88" y="120" width="44" height="79" fill="#70432b" stroke="#553522" strokeWidth="6" />
          <rect x="98" y="132" width="24" height="28" fill="#72a4a0" stroke="#4d6d63" strokeWidth="4" />
          <rect x="26" y="104" width="39" height="37" fill="#7da7a2" stroke="#65452e" strokeWidth="6" />
          <path d="M45 104V141M26 122H65" stroke="#65452e" strokeWidth="4" />
          <rect x="154" y="104" width="34" height="37" fill="#7da7a2" stroke="#65452e" strokeWidth="6" />
          <path d="M171 104V141M154 122H188" stroke="#65452e" strokeWidth="4" />
          <rect x="11" y="193" width="197" height="13" fill="#8a613c" />
          <rect x="7" y="197" width="27" height="25" fill="#b67d45" stroke="#64462f" strokeWidth="4" />
          <rect x="190" y="197" width="27" height="25" fill="#b67d45" stroke="#64462f" strokeWidth="4" />
        </g>

        <g transform="translate(748 66)" className="farm-barn" shapeRendering="crispEdges">
          <rect x="0" y="48" width="164" height="141" fill="#90704f" stroke="#594632" strokeWidth="8" />
          <path d="M-13 58L77 -8L178 58V75H-13Z" fill="#554a3b" stroke="#40382e" strokeWidth="7" />
          <path d="M6 57L77 7L159 57" fill="none" stroke="#8e7a5e" strokeWidth="9" />
          <rect x="55" y="95" width="55" height="94" fill="#483d32" stroke="#302b25" strokeWidth="6" />
          <path d="M82 95V189" stroke="#aa8152" strokeWidth="4" />
          <rect x="123" y="87" width="27" height="31" fill="#8ab0a4" stroke="#4b4439" strokeWidth="5" />
          <path d="M136 87V118M123 102H150" stroke="#4b4439" strokeWidth="3" />
          <rect x="13" y="139" width="27" height="30" fill="#a4b5a0" stroke="#594632" strokeWidth="4" />
        </g>

        <g transform="translate(754 346)" className="farm-pond" shapeRendering="crispEdges">
          <rect width="190" height="145" fill="#6c5941" stroke="#594733" strokeWidth="8" />
          <rect x="11" y="10" width="168" height="121" fill="url(#farm-water)" />
          <path d="M24 25H61M112 46H151M48 87H87M125 105H161" stroke="#a2c9d4" strokeWidth="5" opacity=".7" />
          <path d="M28 12L46 4L53 14L37 22ZM139 119L154 109L162 122L148 132Z" fill="#4e9255" />
          <path d="M62 8L69 1L75 10L82 4" fill="none" stroke="#73ad63" strokeWidth="5" />
          <circle cx="96" cy="68" r="8" fill="#7dc0cf" opacity=".6" />
        </g>

        <g transform="translate(306 80)" shapeRendering="crispEdges">
          <rect x="0" y="0" width="326" height="48" fill="#54813e" stroke="#9a7149" strokeWidth="7" />
          {Array.from({ length: 12 }, (_, index) => (
            <g key={index} transform={`translate(${index * 26 + 8} 6)`}>
              <rect x="0" y="0" width="14" height="35" fill="#79522f" />
              <rect x="2" y="3" width="10" height="28" fill="#5e963f" />
              <rect x="4" y="7" width="7" height="7" fill="#d85a45" />
              <rect x="1" y="20" width="9" height="6" fill="#e3aa4d" />
            </g>
          ))}
        </g>

        <g transform="translate(304 385)" shapeRendering="crispEdges">
          <rect width="327" height="62" fill="#a67c4f" stroke="#745233" strokeWidth="8" />
          <rect x="10" y="7" width="306" height="46" fill="#c49a64" />
          {Array.from({ length: 10 }, (_, index) => (
            <rect key={index} x={index * 30 + 12} y="21" width="20" height="5" fill="#91683f" />
          ))}
        </g>

        {plots.map((plot, index) => {
          const { x, y } = locations[index];
          const crop = plot.crop ? getFarmCrop(plot.crop) : null;
          const ready = isCropReady(plot);
          const selected = plot.id === selectedPlotId;
          return (
            <g
              key={plot.id}
              role="button"
              tabIndex={0}
              aria-label={
                `Plot ${plot.id}: ${crop ? crop.name + (ready ? ', ready to harvest' : ', growing') : 'empty bed'}`
              }
              aria-pressed={selected}
              onClick={() => onSelectPlot(plot.id)}
              onKeyDown={(event) => handlePlotKeyDown(event, plot.id)}
              className={selected ? 'farm-map-plot is-selected' : 'farm-map-plot'}
              transform={`translate(${x} ${y})`}
            >
              <rect x="-4" y="-4" width="82" height="87" fill="#5d3d2a" />
              <rect x="0" y="0" width="74" height="79" fill="#8b5b34" />
              <rect x="5" y="5" width="64" height="69" fill="#98683c" />
              <path d="M8 21H65M8 44H65M8 66H65" stroke="#70482d" strokeWidth="4" />
              <path d="M15 7V72M36 7V72M57 7V72" stroke="#ad7b48" strokeWidth="2" opacity=".55" />
              <rect
                className="farm-map-plot-outline"
                x="-5"
                y="-5"
                width="84"
                height="89"
                fill="none"
                stroke={selected ? '#f5d76e' : '#4d3628'}
                strokeWidth={selected ? '5' : '3'}
              />
              <CropPixels plot={plot} x={0} y={0} />
              {ready && <rect x="28" y="-13" width="20" height="8" fill="#f3d66c" />}
            </g>
          );
        })}

        <FarmTree x={655} y={160} />
        <FarmTree x={676} y={255} fruit />
        <g transform="translate(640 365)" className="farm-player" shapeRendering="crispEdges">
          <ellipse cx="20" cy="47" rx="21" ry="7" fill="#355d39" opacity=".4" />
          <rect x="8" y="22" width="26" height="20" fill="#e2b45e" />
          <rect x="12" y="12" width="18" height="17" fill="#d99a65" />
          <rect x="11" y="9" width="20" height="7" fill="#65452f" />
          <rect x="16" y="20" width="4" height="4" fill="#28251f" />
          <rect x="25" y="20" width="4" height="4" fill="#28251f" />
          <rect x="10" y="40" width="8" height="15" fill="#304e73" />
          <rect x="25" y="40" width="8" height="15" fill="#304e73" />
          <rect x="4" y="28" width="7" height="17" fill="#d99a65" />
          <rect x="33" y="28" width="7" height="17" fill="#d99a65" />
          <rect x="8" y="54" width="10" height="5" fill="#493c32" />
          <rect x="24" y="54" width="10" height="5" fill="#493c32" />
        </g>

        <g className="farm-map-sign" transform="translate(620 82)" shapeRendering="crispEdges">
          <rect x="0" y="0" width="66" height="51" fill="#65472d" stroke="#493321" strokeWidth="4" />
          <rect x="6" y="6" width="54" height="39" fill="#ead4a1" />
          <path d="M17 16H48M17 24H43M17 32H38" stroke="#80613d" strokeWidth="3" />
        </g>
      </svg>
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
  const [notice, setNotice] = useState('Welcome to your farm. Select a plot and plant your first seeds.');
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
  const selectedCrop = FARM_CROPS.find((crop) => crop.id === selectedSeed) ?? FARM_CROPS[0];
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
          : `${crop.name} are growing in Plot ${plotId}. Water them before ending the day.`,
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
      `${selectedCrop.name} planted in Plot ${selectedPlotId}. Water the soil, then end the day to help it grow.`,
    );
  }

  function waterSelectedPlot() {
    const next = waterFarmPlot(farm, selectedPlotId);
    if (next === farm) return;
    setFarm(next);
    setNotice(`${plantedCrop?.name ?? 'Crop'} watered. End the day to grow it.`);
  }

  function harvestSelectedPlot() {
    const outcome = harvestFarmPlot(farm, selectedPlotId);
    if (!outcome.crop) return;
    setFarm(outcome.state);
    setNotice(
      outcome.goalReward > 0
        ? `You harvested ${outcome.crop.name} and completed the starter goal. +${outcome.crop.sellPrice} coins plus a ${outcome.goalReward}-coin reward!`
        : `You harvested ${outcome.crop.name}. +${outcome.crop.sellPrice} coins.`,
    );
  }

  function endDay() {
    const wateredCount = farm.plots.filter((plot) => plot.watered).length;
    const next = advanceFarmDay(farm);
    setFarm(next);
    setNotice(
      wateredCount > 0
        ? `Day ${next.day} begins. ${wateredCount} watered ${wateredCount === 1 ? 'crop has' : 'crops have'} grown.`
        : `Day ${next.day} begins. Water your crops before ending the day so they can grow.`,
    );
  }

  const plantedCount = farm.plots.filter((plot) => plot.crop !== null).length;
  const readyCount = farm.plots.filter(isCropReady).length;

  return (
    <section className="harvest-game farm-sim" aria-label="Harvest Rush farm simulation">
      <header className="farm-topbar">
        <div className="farm-brand">
          <span className="farm-brand-mark" aria-hidden="true">✦</span>
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
          <span className="farm-sun" aria-hidden="true">☀</span>
          <span><strong>Clear skies</strong><small>Good day for the farm</small></span>
        </div>
      </div>

      <div className="farm-goal">
        <div className="farm-goal-copy">
          <div>
            <span className="farm-eyebrow">YOUR FIRST TASK</span>
            <strong>{farm.goalComplete ? 'Starter farm complete!' : 'Harvest 4 crops'}</strong>
          </div>
          <span className="farm-goal-count">{goalProgress}/{FARM_GOAL}</span>
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
            ? 'You earned the 20-coin starter reward. Keep growing and fill the whole farm.'
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
            <span><i className="is-empty" /> Empty plot</span>
            <span><i className="is-growing" /> Growing</span>
            <span><i className="is-ready" /> Ready to harvest</span>
          </div>
        </div>

        <aside className="farm-side-panel" aria-label="Farm actions">
          <div className="farm-panel-heading">
            <div>
              <span className="farm-eyebrow">PLOT {String(selectedPlotId).padStart(2, '0')}</span>
              <h3>{plantedCrop ? plantedCrop.name : 'Empty garden bed'}</h3>
            </div>
            <span className={selectedReady ? 'farm-state-tag is-ready' : plantedCrop ? 'farm-state-tag is-growing' : 'farm-state-tag'}>
              {selectedReady ? 'Ready' : plantedCrop ? 'Growing' : 'Empty'}
            </span>
          </div>

          {plantedCrop ? (
            <div className="farm-crop-status">
              <div className={`farm-crop-preview is-${plantedCrop.id}`}>
                <SeedMark cropId={plantedCrop.id} />
              </div>
              <div className="farm-crop-progress-copy">
                <strong>{selectedReady ? 'Ready to harvest!' : `Growing · Day ${selectedPlot.growth} of ${plantedCrop.growDays}`}</strong>
                <span>
                  {selectedReady
                    ? `Sell this harvest for ${plantedCrop.sellPrice} coins.`
                    : selectedPlot.watered
                      ? 'Watered today. End the day to help it grow.'
                      : 'Give this crop water before you end the day.'}
                </span>
              </div>
              <div className="farm-growth-track" role="progressbar" aria-label={`${plantedCrop.name} growth`} aria-valuemin={0} aria-valuemax={plantedCrop.growDays} aria-valuenow={selectedPlot.growth}>
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
                    className={selectedSeed === crop.id ? 'farm-seed-option is-selected' : 'farm-seed-option'}
                    onClick={() => setSelectedSeed(crop.id)}
                    aria-pressed={selectedSeed === crop.id}
                  >
                    <SeedMark cropId={crop.id} />
                    <span className="farm-seed-option-name">{crop.name}</span>
                    <span className="farm-seed-option-meta">{crop.seedCost} coins · {crop.growDays} days</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="farm-primary-action"
                onClick={plantSelectedSeed}
                disabled={farm.coins < selectedCrop.seedCost}
              >
                Plant {selectedCrop.name.toLowerCase()} <span>{selectedCrop.seedCost} coins</span>
              </button>
            </div>
          )}

          {plantedCrop && selectedReady && (
            <button type="button" className="farm-primary-action" onClick={harvestSelectedPlot}>
              Harvest {plantedCrop.name.toLowerCase()} <span>+{plantedCrop.sellPrice} coins</span>
            </button>
          )}
          {plantedCrop && !selectedReady && !selectedPlot.watered && (
            <button type="button" className="farm-primary-action" onClick={waterSelectedPlot}>
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
          <button type="button" className="farm-secondary-action" onClick={endDay}>
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
          <li><span>1</span><strong>Choose a plot</strong><small>Tap any empty soil bed on the map.</small></li>
          <li><span>2</span><strong>Plant a seed</strong><small>Pick a crop you can afford.</small></li>
          <li><span>3</span><strong>Water & rest</strong><small>Water it, then press End day.</small></li>
          <li><span>4</span><strong>Harvest & sell</strong><small>When it is ready, collect your coins.</small></li>
        </ol>
      </div>

      <p className="farm-notice" role="status" aria-live="polite">{notice}</p>
      <p className="farm-disclaimer">
        Crop prices and growing times are fictional game rules, not farming or market advice. Your progress is saved on this device.
      </p>
    </section>
  );
}
