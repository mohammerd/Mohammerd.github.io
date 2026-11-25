'use client';

import { useState } from 'react';

import HarvestRushGame from './HarvestRushGame';

type GameId = 'harvest-rush' | 'snake';

const SNAKE_GAME_URL = 'https://mohammerd.github.io/Snakegame/';

export default function GameHub() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  if (activeGame === 'harvest-rush') {
    return (
      <div className="play-active-game">
        <div className="play-active-game-nav">
          <button
            type="button"
            className="play-back-button"
            onClick={() => setActiveGame(null)}
          >
            <span aria-hidden="true">←</span> All games
          </button>
          <span className="play-active-game-label">NOW PLAYING / 01</span>
        </div>
        <HarvestRushGame />
      </div>
    );
  }

  if (activeGame === 'snake') {
    return (
      <div className="play-active-game">
        <div className="play-active-game-nav">
          <button
            type="button"
            className="play-back-button"
            onClick={() => setActiveGame(null)}
          >
            <span aria-hidden="true">←</span> All games
          </button>
          <span className="play-active-game-label">NOW PLAYING / 02</span>
        </div>

        <section className="snake-game-embed" aria-label="Snake game">
          <div className="snake-game-embed-heading">
            <p>Snake runs entirely in your browser. Your scores and settings stay on this device.</p>
            <a href={SNAKE_GAME_URL} target="_blank" rel="noopener noreferrer">
              Open in new tab <span aria-hidden="true">↗</span>
            </a>
          </div>
          <iframe
            className="snake-game-iframe"
            src={SNAKE_GAME_URL}
            title="Snake Game"
            loading="lazy"
            allow="autoplay"
          />
        </section>
      </div>
    );
  }

  return (
    <section className="play-game-selection" aria-labelledby="play-game-selection-title">
      <div className="play-game-selection-heading">
        <div>
          <p className="play-section-kicker">THE GAME LIBRARY / 02 TITLES</p>
          <h2 id="play-game-selection-title">Choose a game.</h2>
          <p>Two different challenges. No account, installation, or subscription required.</p>
        </div>
        <span className="play-library-count">02 <small>GAMES</small></span>
      </div>

      <div className="play-games-grid">
        <button
          type="button"
          className="play-game-card"
          onClick={() => setActiveGame('harvest-rush')}
          aria-label="Play Harvest Rush"
        >
          <span className="play-game-art play-game-art--harvest" aria-hidden="true">
            <span className="play-game-art-topline">01 / FIELD STRATEGY</span>
            <svg viewBox="0 0 360 150" fill="none" role="presentation">
              <path d="M30 30H330M30 76H330M30 122H330M82 18V134M178 18V134M274 18V134" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" />
              <path d="M42 55C58 43 66 44 82 55M42 101C58 89 66 90 82 101M138 55C154 43 162 44 178 55M138 101C154 89 162 90 178 101M234 55C250 43 258 44 274 55M234 101C250 89 258 90 274 101" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M61 47V31M157 47V31M253 47V31M61 93V77M157 93V77M253 93V77" stroke="#b7d68a" strokeWidth="3" strokeLinecap="round" />
              <path d="M61 36C49 26 47 19 49 15C61 17 67 24 61 36ZM61 36C72 24 80 22 84 25C80 36 72 40 61 36ZM157 36C145 26 143 19 145 15C157 17 163 24 157 36ZM157 36C168 24 176 22 180 25C176 36 168 40 157 36ZM253 36C241 26 239 19 241 15C253 17 259 24 253 36ZM253 36C264 24 272 22 276 25C272 36 264 40 253 36Z" fill="#b7d68a" />
              <circle cx="310" cy="110" r="12" fill="#d6a45e" />
              <path d="M310 97C311 91 316 88 321 90" stroke="#b7d68a" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="play-game-art-bottomline">PLAN / ALLOCATE / HARVEST</span>
          </span>
          <span className="play-game-card-body">
            <span className="play-game-card-meta">
              <span>STRATEGY</span>
              <span>3 MISSIONS</span>
            </span>
            <strong>Harvest Rush</strong>
            <span className="play-game-description">
              Plan a farm, manage limited resources, and make decisions before the weather changes.
            </span>
            <span className="play-game-card-footer">
              <span>PLAY HARVEST RUSH</span>
              <span aria-hidden="true">↗</span>
            </span>
          </span>
        </button>

        <button
          type="button"
          className="play-game-card"
          onClick={() => setActiveGame('snake')}
          aria-label="Play Snake Game"
        >
          <span className="play-game-art play-game-art--snake" aria-hidden="true">
            <span className="play-game-art-topline">02 / ARCADE CLASSIC</span>
            <svg viewBox="0 0 360 150" fill="none" role="presentation">
              <path d="M28 27H332V123H28V27Z" stroke="currentColor" strokeOpacity=".18" strokeWidth="1.5" />
              <path d="M52 49H88V85H124V49H160V85H196V85H232" stroke="#86d9a0" strokeWidth="15" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M232 85H268V49H304" stroke="#86d9a0" strokeWidth="15" strokeLinecap="square" strokeLinejoin="round" />
              <path d="M296 42L310 49L296 56" stroke="#071b14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="304" cy="104" r="9" fill="#f0a15c" />
              <path d="M304 95C304 89 309 86 314 88" stroke="#86d9a0" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="play-game-art-bottomline">MOVE / GROW / SURVIVE</span>
          </span>
          <span className="play-game-card-body">
            <span className="play-game-card-meta">
              <span>ARCADE</span>
              <span>4 SPEEDS</span>
            </span>
            <strong>Snake Game</strong>
            <span className="play-game-description">
              Control the snake, collect food, build combos, and beat your personal best.
            </span>
            <span className="play-game-card-footer">
              <span>PLAY SNAKE</span>
              <span aria-hidden="true">↗</span>
            </span>
          </span>
        </button>
      </div>

      <p className="play-library-note">
        Both games run without accounts or subscriptions. Progress is stored locally in your browser.
      </p>
    </section>
  );
}
