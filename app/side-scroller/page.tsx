'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/SideScrollerPage.css';

// Fallback character images if no custom image is saved
const girlCharacter = '/images/characters/Girl_Character_BrownHair.png';
const boyCharacter = '/images/characters/Boy_Character_BrownHair.png';
const brownGirlCharacter = '/images/characters/Brown_Girl_Character_BlackHair.png';
const brownBoyCharacter = '/images/characters/Brown_Boy_Character_BlackHair.png';
const blondeGirlCharacter = '/images/characters/Girl_Character_BlondeHair.png';
const blondeBoyCharacter = '/images/characters/Boy_Character_BlondeHair_NEW.png';

interface Coin {
  x: number; // 0–100 (percentage of width)
  y: number; // height above ground in "units"
  collected: boolean;
}

interface Obstacle {
  x: number; // left position, 0–100
  width: number; // width in percentage units
  height: number; // height in "units" above ground
}

const WORLD_WIDTH = 100;
const GROUND_Y = 0;
const GRAVITY = -160; // units per second^2
const JUMP_VELOCITY = 65; // units per second
const MOVE_SPEED = 45; // horizontal units per second
const CHARACTER_WIDTH = 8; // in world units

const initialCoins: Coin[] = [
  { x: 22, y: 16, collected: false },
  { x: 38, y: 20, collected: false },
  { x: 55, y: 18, collected: false },
  { x: 72, y: 22, collected: false },
  { x: 88, y: 24, collected: false }
];

const obstacles: Obstacle[] = [
  { x: 30, width: 6, height: 10 },
  { x: 48, width: 7, height: 10 },
  { x: 66, width: 6, height: 11 }
];

export default function SideScrollerPage() {
  const { character, addCoins, addExperience, addPoints } = useCharacter();

  // Character position (x is 0–100, y is height above ground)
  const [renderX, setRenderX] = useState(10);
  const [renderY, setRenderY] = useState(0);
  const [coins, setCoins] = useState<Coin[]>(initialCoins);
  const [collectedCount, setCollectedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  // Physics & input refs
  const xRef = useRef(10);
  const yRef = useRef(0);
  const velocityYRef = useRef(0);
  const onGroundRef = useRef(true);
  const keysRef = useRef({ left: false, right: false });
  const gameOverRef = useRef(false);
  const hasWonRef = useRef(false);
  const rewardGivenRef = useRef(false);

  // Sync flags
  useEffect(() => {
    gameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    hasWonRef.current = hasWon;
  }, [hasWon]);

  const resetGame = () => {
    xRef.current = 10;
    yRef.current = 0;
    velocityYRef.current = 0;
    onGroundRef.current = true;
    setRenderX(10);
    setRenderY(0);
    setCoins(initialCoins.map(c => ({ ...c, collected: false })));
    setCollectedCount(0);
    setIsGameOver(false);
    setHasWon(false);
    rewardGivenRef.current = false;
    setStatusMessage(null);
    setStatusType(null);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        keysRef.current.right = true;
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        // Jump only if on ground and game is active
        if (onGroundRef.current && !gameOverRef.current && !hasWonRef.current) {
          velocityYRef.current = JUMP_VELOCITY;
          onGroundRef.current = false;
        }
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    let lastTime = performance.now();
    let animationId: number;

    const step = (time: number) => {
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.04); // clamp for safety
      lastTime = time;

      if (!gameOverRef.current && !hasWonRef.current) {
        let x = xRef.current;
        let y = yRef.current;
        let vy = velocityYRef.current;

        // Horizontal movement
        const moveDir = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
        x += moveDir * MOVE_SPEED * deltaSeconds;
        x = Math.max(0 + CHARACTER_WIDTH / 2, Math.min(WORLD_WIDTH - CHARACTER_WIDTH / 2, x));

        // Vertical physics
        vy += GRAVITY * deltaSeconds;
        y += vy * deltaSeconds;

        if (y <= GROUND_Y) {
          y = GROUND_Y;
          vy = 0;
          onGroundRef.current = true;
        } else {
          onGroundRef.current = false;
        }

        // Collision with obstacles (simple AABB check near ground)
        const charLeft = x - CHARACTER_WIDTH / 2;
        const charRight = x + CHARACTER_WIDTH / 2;
        const charHeight = 16 + y; // approx height used for collision

        for (const obstacle of obstacles) {
          const obsLeft = obstacle.x;
          const obsRight = obstacle.x + obstacle.width;
          const obsHeight = obstacle.height;

          const horizontalOverlap = charRight > obsLeft && charLeft < obsRight;
          const verticalHit = y < obsHeight && charHeight > 0;

          if (horizontalOverlap && verticalHit) {
            setIsGameOver(true);
            setStatusMessage('Ouch! You bonked into a block. Press R or tap "Play Again" to try again.');
            setStatusType('error');
            gameOverRef.current = true;
            break;
          }
        }

        // Coin collection
        setCoins(prevCoins => {
          let updated = prevCoins;
          let collectedNow = 0;
          updated = prevCoins.map(c => {
            if (c.collected) return c;
            const dx = Math.abs(c.x - x);
            const dy = Math.abs(c.y - y);
            if (dx < CHARACTER_WIDTH / 1.8 && dy < 10) {
              collectedNow += 1;
              return { ...c, collected: true };
            }
            return c;
          });
          if (collectedNow > 0) {
            setCollectedCount(count => count + collectedNow);
          }
          return updated;
        });

        // Win condition: reach flag at far right
        if (!hasWonRef.current && x > 94) {
          setHasWon(true);
          hasWonRef.current = true;
          setStatusMessage(
            `You reached the flag and collected ${collectedCount + 0} coins! 🎉`
          );
          setStatusType('success');

          if (!rewardGivenRef.current) {
            rewardGivenRef.current = true;
            // Reward the player once per run
            addCoins(40);
            addExperience(80);
            addPoints(120);
          }
        }

        xRef.current = x;
        yRef.current = y;
        velocityYRef.current = vy;
        setRenderX(x);
        setRenderY(y);
      }

      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [addCoins, addExperience, addPoints, collectedCount]);

  const collectedTotal = coins.filter(c => c.collected).length;
  const totalCoins = coins.length;

  const getCharacterImage = () => {
    if (character.image) return character.image;
    if (character.id === 'boy1') return boyCharacter;
    if (character.id === 'brown-boy1') return brownBoyCharacter;
    if (character.id === 'brown-girl1') return brownGirlCharacter;
    if (character.id === 'blonde-girl1') return blondeGirlCharacter;
    if (character.id === 'blonde-boy1') return blondeBoyCharacter;
    return girlCharacter;
  };

  const characterImage = getCharacterImage();

  // Helpers for mobile controls
  const pressLeft = () => {
    keysRef.current.left = true;
    setTimeout(() => {
      keysRef.current.left = false;
    }, 150);
  };

  const pressRight = () => {
    keysRef.current.right = true;
    setTimeout(() => {
      keysRef.current.right = false;
    }, 150);
  };

  const pressJump = () => {
    if (onGroundRef.current && !gameOverRef.current && !hasWonRef.current) {
      velocityYRef.current = JUMP_VELOCITY;
      onGroundRef.current = false;
    }
  };

  const flagXPercent = 96;

  return (
    <ProtectedRoute>
      <div className="side-scroller-page">
        <Navigation />
        <div className="side-scroller-wrapper">
          <header className="side-scroller-header">
            <h1>🏃‍♂️ Side Scroller Run</h1>
            <div className="side-scroller-stats">
              <div className="side-scroller-character-badge">
                <div className="side-scroller-character-avatar">
                  <img src={characterImage} alt={character.name || 'Your character'} />
                </div>
                <span>{character.name || 'Coder'}</span>
              </div>
              <div className="side-scroller-stats-row">
                <span>🪙 {character.coins} Coins</span>
                <span>⭐ {character.experience} XP</span>
                <span>🏆 {character.points || 0} Points</span>
              </div>
            </div>
          </header>

          <main className="side-scroller-main">
            <section className="side-scroller-game-card">
              <div className="side-scroller-instructions">
                <h2>How to Play</h2>
                <ul>
                  <li>
                    Use <span className="side-scroller-key">←</span> /{' '}
                    <span className="side-scroller-key">A</span> and{' '}
                    <span className="side-scroller-key">→</span> /{' '}
                    <span className="side-scroller-key">D</span> to run left &amp; right.
                  </li>
                  <li>
                    Press <span className="side-scroller-key">Space</span>,{' '}
                    <span className="side-scroller-key">↑</span> or{' '}
                    <span className="side-scroller-key">W</span> to jump over obstacles.
                  </li>
                  <li>Collect as many glowing coins as you can and reach the flag at the right side.</li>
                  <li>Earn coins, XP, and points each time you reach the flag!</li>
                </ul>
              </div>

              <div className="side-scroller-world">
                {/* Character */}
                <div
                  className="side-scroller-character"
                  style={{
                    left: `${renderX}%`,
                    transform: `translate(-50%, ${renderY}px)`
                  }}
                >
                  <div className="side-scroller-character-inner">
                    <img src={characterImage} alt={character.name || 'Your character'} />
                  </div>
                </div>

                {/* Coins */}
                {coins.map((coin, index) =>
                  coin.collected ? null : (
                    <div
                      key={index}
                      className="side-scroller-coin"
                      style={{
                        left: `${coin.x}%`,
                        bottom: `${60 + coin.y}px`
                      }}
                    >
                      🪙
                    </div>
                  )
                )}

                {/* Obstacles */}
                {obstacles.map((obstacle, index) => (
                  <div
                    key={index}
                    className="side-scroller-obstacle"
                    style={{
                      left: `${obstacle.x}%`,
                      bottom: '60px',
                      height: `${obstacle.height}px`,
                      width: `${obstacle.width}%`
                    }}
                  />
                ))}

                {/* Flag / Goal */}
                <div
                  className="side-scroller-flag"
                  style={{
                    left: `${flagXPercent}%`
                  }}
                >
                  <div className="side-scroller-flag-pole" />
                  <div className="side-scroller-flag-banner">GOAL</div>
                </div>

                <div className="side-scroller-ground" />
              </div>

              <div className="side-scroller-ui-row">
                <div className="side-scroller-status">
                  <span>
                    🪙 Coins: {collectedTotal} / {totalCoins}
                  </span>
                  <span>
                    {isGameOver && 'Game Over — press R or tap "Play Again"'}
                    {hasWon && !isGameOver && 'Nice run! Try to collect every coin.'}
                    {!isGameOver && !hasWon && 'Run, jump, and reach the flag!'}
                  </span>
                </div>
                <div className="side-scroller-controls">
                  <button
                    type="button"
                    className="side-scroller-btn secondary"
                    onClick={resetGame}
                  >
                    🔁 Play Again
                  </button>
                  <button
                    type="button"
                    className="side-scroller-btn"
                    onClick={pressLeft}
                  >
                    ⬅️ Left
                  </button>
                  <button
                    type="button"
                    className="side-scroller-btn"
                    onClick={pressJump}
                  >
                    ⬆️ Jump
                  </button>
                  <button
                    type="button"
                    className="side-scroller-btn"
                    onClick={pressRight}
                  >
                    Right ➡️
                  </button>
                </div>
              </div>

              {statusMessage && statusType && (
                <div
                  className={`side-scroller-message ${
                    statusType === 'success' ? 'success' : 'error'
                  }`}
                >
                  {statusType === 'success' ? '✅ ' : '❌ '}
                  {statusMessage}
                </div>
              )}
            </section>

            <aside className="side-scroller-sidebar">
              <h2>Why this game is awesome</h2>
              <ul>
                <li>Practice timing and planning jumps like a classic platformer.</li>
                <li>Use your own CodeKingdom character as the hero.</li>
                <li>Earn extra coins, XP, and points to spend in the shop.</li>
              </ul>
              <div className="side-scroller-chip-row">
                <span className="side-scroller-chip">👟 Run &amp; Jump</span>
                <span className="side-scroller-chip">🪙 Collect Coins</span>
                <span className="side-scroller-chip">🏳️ Reach the Flag</span>
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Tip: Try playing with different characters and accessories to see who is the
                fastest runner!
              </p>
            </aside>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

