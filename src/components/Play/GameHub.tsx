'use client';

import { useEffect, useRef, useState } from 'react';

import { withBasePath } from '@/lib/utils';
import HarvestRushGame from './HarvestRushGame';

type GameId = 'agroguardai-farm' | 'snake';

const SNAKE_GAME_URL = withBasePath('/Snakegame/');
const monoStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  letterSpacing: '0.045em',
} as const;
const mutedStyle = {
  color: 'var(--color-fg-light)',
  fontSize: 'var(--text-sm)',
  lineHeight: 1.5,
} as const;
const artLabelStyle = { ...monoStyle, opacity: 0.82 } as const;
const metaStyle = {
  ...monoStyle,
  display: 'flex',
  justifyContent: 'space-between',
  gap: '.5rem',
  width: '100%',
  color: 'var(--color-fg-light)',
} as const;
const footerStyle = {
  ...metaStyle,
  marginTop: 'auto',
  paddingTop: '.75rem',
  borderTop: '1px solid var(--color-border)',
  color: 'var(--color-accent)',
} as const;
const titleStyle = {
  color: 'var(--color-fg-bold)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-xl)',
  fontWeight: 500,
} as const;
const harvestArtStyle = {
  background:
    'radial-gradient(circle at 86% 20%, rgba(183,214,138,.2), transparent 34%), linear-gradient(135deg,#1a3025,#263e2a 58%,#17291f)',
  color: '#e4efda',
} as const;
const snakeArtStyle = {
  background:
    'radial-gradient(circle at 82% 18%, rgba(110,231,183,.18), transparent 34%), linear-gradient(135deg,#071a16,#102c23 58%,#071b15)',
  color: '#d8f5df',
} as const;
const gameGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
  gap: '1rem',
} as const;
const gameCardStyle = {
  display: 'flex',
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  flexDirection: 'column',
  alignItems: 'stretch',
  overflow: 'hidden',
  padding: 0,
  textAlign: 'left',
} as const;
const gameArtStyle = {
  display: 'flex',
  width: '100%',
  minHeight: '11rem',
  boxSizing: 'border-box',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '1rem',
} as const;
const gameArtSvgStyle = { width: '100%', maxHeight: '7rem' } as const;
const snakeGameEmbedStyle = {
  overflow: 'hidden',
  border: '1px solid var(--color-border-alt)',
  borderRadius: 'var(--radius-sm)',
  background: '#030712',
} as const;
const embedHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '.75rem 1rem',
  borderBottom: '1px solid rgba(255,255,255,.12)',
  background: '#0b1714',
  color: '#dbe7df',
} as const;
const sectionKickerStyle = {
  ...monoStyle,
  margin: '0 0 .55rem',
  color: 'var(--color-fg-light)',
} as const;
const libraryCountStyle = {
  ...monoStyle,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  color: 'var(--color-fg-bold)',
  fontSize: 'var(--text-lg)',
} as const;
const libraryCountLabelStyle = {
  color: 'var(--color-fg-light)',
  fontSize: 'var(--text-xs)',
  fontWeight: 400,
} as const;
const cardBodyStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'start',
  gap: '.65rem',
  padding: '1rem',
} as const;
const embedParagraphStyle = {
  margin: 0,
  color: '#aab9ae',
  fontSize: 'var(--text-xs)',
  lineHeight: 1.45,
} as const;
const openGameLinkStyle = {
  color: '#a9e7b5',
  fontSize: 'var(--text-xs)',
  textDecoration: 'underline',
  textUnderlineOffset: '.2em',
} as const;
const libraryNoteStyle = {
  ...mutedStyle,
  margin: 0,
  fontSize: 'var(--text-xs)',
} as const;

export default function GameHub() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeGame) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      // Let the browser leave native fullscreen first. A second Escape returns
      // the player to the game library.
      if (event.key === 'Escape' && !document.fullscreenElement) {
        setActiveGame(null);
      }
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === screenRef.current);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (
        document.fullscreenElement === screenRef.current &&
        typeof document.exitFullscreen === 'function'
      ) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
  }, [activeGame]);

  async function toggleFullscreen() {
    const screen = screenRef.current;
    if (!screen) return;

    try {
      if (document.fullscreenElement === screen) {
        await document.exitFullscreen();
      } else if (typeof screen.requestFullscreen === 'function') {
        await screen.requestFullscreen();
      }
    } catch {
      // The immersive viewport still works when native fullscreen is blocked.
    }
  }

  function returnToLibrary() {
    if (
      document.fullscreenElement === screenRef.current &&
      typeof document.exitFullscreen === 'function'
    ) {
      void document.exitFullscreen().catch(() => undefined);
    }
    setActiveGame(null);
  }

  function renderScreenHeader(gameNumber: string, title: string) {
    return (
      <header className="play-game-screen-toolbar">
        <button
          type="button"
          className="button button-secondary button-compact play-screen-action"
          onClick={returnToLibrary}
        >
          <span aria-hidden="true">←</span> All games
        </button>
        <div className="play-game-screen-brand">
          <span className="play-game-screen-label">
            NOW PLAYING / {gameNumber}
          </span>
          <strong className="play-game-screen-title">{title}</strong>
        </div>
        <button
          type="button"
          className="button button-secondary button-compact play-screen-action"
          onClick={() => void toggleFullscreen()}
          aria-label={
            isFullscreen ? 'Exit browser full screen' : 'Enter browser full screen'
          }
        >
          <span aria-hidden="true">⛶</span>
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </button>
      </header>
    );
  }

  if (activeGame === 'agroguardai-farm') {
    return (
      <div
        ref={screenRef}
        className="play-game-screen"
        role="region"
        aria-label="Full-screen AgroGuardAI farm game"
      >
        {renderScreenHeader('01', 'AgroGuardAI')}
        <div className="play-game-screen-content">
          <div className="play-active-game">
            <HarvestRushGame />
          </div>
        </div>
      </div>
    );
  }

  if (activeGame === 'snake') {
    return (
      <div
        ref={screenRef}
        className="play-game-screen"
        role="region"
        aria-label="Full-screen Snake game"
      >
        {renderScreenHeader('02', 'Snake Game')}
        <div className="play-game-screen-content">
          <div className="play-active-game">
            <section
              className="snake-game-embed"
              style={snakeGameEmbedStyle}
              aria-label="Snake game"
            >
              <div className="snake-game-embed-heading" style={embedHeaderStyle}>
                <p style={embedParagraphStyle}>
                  Snake runs entirely in your browser. Your scores and settings
                  stay on this device.
                </p>
                <a
                  href={SNAKE_GAME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={openGameLinkStyle}
                >
                  Open in new tab <span aria-hidden="true">↗</span>
                </a>
              </div>
              <iframe
                className="snake-game-frame"
                src={SNAKE_GAME_URL}
                title="Snake Game"
                loading="eager"
                allow="autoplay"
              />
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className="play-game-selection"
      style={{ display: 'grid', gap: '1rem' }}
      aria-labelledby="play-game-selection-title"
    >
      <div className="section-header">
        <div>
          <p className="play-section-kicker" style={sectionKickerStyle}>
            THE GAME LIBRARY / 02 GAMES
          </p>
          <h2 id="play-game-selection-title" className="section-heading">
            Choose a game.
          </h2>
          <p style={{ ...mutedStyle, margin: 0 }}>
            Two different challenges. No account, installation, or subscription
            required.
          </p>
        </div>
        <span className="play-library-count" style={libraryCountStyle}>
          02 <small style={libraryCountLabelStyle}>GAMES</small>
        </span>
      </div>

      <div className="play-games-grid" style={gameGridStyle}>
        <button
          type="button"
          className="button button-secondary play-game-card"
          style={gameCardStyle}
          onClick={() => setActiveGame('agroguardai-farm')}
          aria-label="Play AgroGuardAI"
        >
          <span
            className="play-game-art play-game-art--harvest"
            style={{ ...gameArtStyle, ...harvestArtStyle }}
            aria-hidden="true"
          >
            <span className="play-game-art-topline" style={artLabelStyle}>
              01 / FARM SIMULATOR
            </span>
            <svg
              viewBox="0 0 360 150"
              fill="none"
              role="presentation"
              style={gameArtSvgStyle}
            >
              <path
                d="M30 30H330M30 76H330M30 122H330M82 18V134M178 18V134M274 18V134"
                stroke="currentColor"
                strokeOpacity=".2"
                strokeWidth="1.5"
              />
              <path
                d="M42 55C58 43 66 44 82 55M42 101C58 89 66 90 82 101M138 55C154 43 162 44 178 55M138 101C154 89 162 90 178 101M234 55C250 43 258 44 274 55M234 101C250 89 258 90 274 101"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M61 47V31M157 47V31M253 47V31M61 93V77M157 93V77M253 93V77"
                stroke="#b7d68a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M61 36C49 26 47 19 49 15C61 17 67 24 61 36ZM61 36C72 24 80 22 84 25C80 36 72 40 61 36ZM157 36C145 26 143 19 145 15C157 17 163 24 157 36ZM157 36C168 24 176 22 180 25C176 36 168 40 157 36ZM253 36C241 26 239 19 241 15C253 17 259 24 253 36ZM253 36C264 24 272 22 276 25C272 36 264 40 253 36Z"
                fill="#b7d68a"
              />
              <circle cx="310" cy="110" r="12" fill="#d6a45e" />
              <path
                d="M310 97C311 91 316 88 321 90"
                stroke="#b7d68a"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="play-game-art-bottomline" style={artLabelStyle}>
              WALK / WORK / GROW
            </span>
          </span>
          <span className="play-game-card-body" style={cardBodyStyle}>
            <span className="play-game-card-meta" style={metaStyle}>
              <span>FARM SIM</span>
              <span>6 PLOTS · 4 TOOLS</span>
            </span>
            <strong style={titleStyle}>AgroGuardAI</strong>
            <span className="play-game-description" style={mutedStyle}>
              Walk the land, till soil, plant crops, water each plot, and
              harvest what you grow.
            </span>
            <span className="play-game-card-footer" style={footerStyle}>
              <span>ENTER THE FARM</span>
              <span aria-hidden="true">↗</span>
            </span>
          </span>
        </button>

        <button
          type="button"
          className="button button-secondary play-game-card"
          style={gameCardStyle}
          onClick={() => setActiveGame('snake')}
          aria-label="Play Snake Game"
        >
          <span
            className="play-game-art play-game-art--snake"
            style={{ ...gameArtStyle, ...snakeArtStyle }}
            aria-hidden="true"
          >
            <span className="play-game-art-topline" style={artLabelStyle}>
              02 / ARCADE CLASSIC
            </span>
            <svg
              viewBox="0 0 360 150"
              fill="none"
              role="presentation"
              style={gameArtSvgStyle}
            >
              <path
                d="M28 27H332V123H28V27Z"
                stroke="currentColor"
                strokeOpacity=".18"
                strokeWidth="1.5"
              />
              <path
                d="M52 49H88V85H124V49H160V85H196V85H232"
                stroke="#86d9a0"
                strokeWidth="15"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M232 85H268V49H304"
                stroke="#86d9a0"
                strokeWidth="15"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M296 42L310 49L296 56"
                stroke="#071b14"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="304" cy="104" r="9" fill="#f0a15c" />
              <path
                d="M304 95C304 89 309 86 314 88"
                stroke="#86d9a0"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="play-game-art-bottomline" style={artLabelStyle}>
              MOVE / GROW / SURVIVE
            </span>
          </span>
          <span className="play-game-card-body" style={cardBodyStyle}>
            <span className="play-game-card-meta" style={metaStyle}>
              <span>ARCADE</span>
              <span>4 SPEEDS</span>
            </span>
            <strong style={titleStyle}>Snake Game</strong>
            <span className="play-game-description" style={mutedStyle}>
              Control the snake, collect food, build combos, and beat your
              personal best.
            </span>
            <span className="play-game-card-footer" style={footerStyle}>
              <span>PLAY SNAKE</span>
              <span aria-hidden="true">↗</span>
            </span>
          </span>
        </button>
      </div>

      <p className="play-library-note" style={libraryNoteStyle}>
        Both games run without accounts or subscriptions. Progress is stored
        locally in your browser.
      </p>
    </section>
  );
}
