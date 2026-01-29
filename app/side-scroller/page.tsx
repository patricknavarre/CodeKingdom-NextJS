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
// Physics tuned so jumps feel more “Mario-like” and reach coins comfortably
const GRAVITY = -600; // units per second^2 (negative = pulls down)
const JUMP_VELOCITY = 220; // units per second (upward)
const MOVE_SPEED = 45; // horizontal units per second
const CHARACTER_WIDTH = 8; // in world units

type GameMode = 'play' | 'code';

type ScriptAction =
  | { type: 'run'; steps: number }
  | { type: 'jump' }
  | { type: 'wait'; seconds: number };
// Platforms you can land on
interface Platform {
  x: number; // left position, 0–100
  width: number; // width in percentage units
  top: number; // height of the top surface above ground (same units as character y)
  thickness: number; // block thickness
}

interface LevelConfig {
  id: number;
  name: string;
  coins: { x: number; y: number }[];
  obstacles: Obstacle[];
  platforms?: Platform[];
}

// Level layouts: start easy, then add platforms / trickier jumps.
const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Warm‑Up Run',
    coins: [
      { x: 18, y: 14 },
      { x: 32, y: 18 },
      { x: 50, y: 20 },
      { x: 72, y: 22 },
      { x: 90, y: 24 }
    ],
    obstacles: [
      { x: 40, width: 4, height: 10 },
      { x: 65, width: 4, height: 10 }
    ]
  },
  {
    id: 2,
    name: 'First Platforms',
    coins: [
      { x: 20, y: 14 },
      { x: 38, y: 20 }, // above first platform
      { x: 52, y: 22 },
      { x: 72, y: 18 },
      { x: 90, y: 24 }
    ],
    obstacles: [
      { x: 30, width: 4, height: 10 }
    ],
    platforms: [
      { x: 34, width: 12, top: 18, thickness: 6 },
      { x: 60, width: 10, top: 14, thickness: 6 }
    ]
  },
  {
    id: 3,
    name: 'Sky Steps',
    coins: [
      { x: 18, y: 14 },
      { x: 34, y: 20 }, // first step
      { x: 50, y: 26 }, // higher step
      { x: 68, y: 20 },
      { x: 88, y: 24 }
    ],
    obstacles: [
      { x: 26, width: 3.5, height: 10 },
      { x: 44, width: 3.5, height: 10 }
    ],
    platforms: [
      { x: 30, width: 12, top: 18, thickness: 6 },
      { x: 46, width: 12, top: 24, thickness: 6 },
      { x: 68, width: 10, top: 18, thickness: 6 }
    ]
  }
];

export default function SideScrollerPage() {
  const { character, addCoins, addExperience, addPoints } = useCharacter();

  // Character position (x is 0–100, y is height above ground)
  const [renderX, setRenderX] = useState(10);
  const [renderY, setRenderY] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [mode, setMode] = useState<GameMode>('code'); // default to learning mode
  const [coins, setCoins] = useState<Coin[]>(
    LEVELS[0].coins.map(c => ({ ...c, collected: false }))
  );
  const [collectedCount, setCollectedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [codeText, setCodeText] = useState(
    [
      '# Code your run! Examples:',
      '# run(4)',
      '# jump()',
      '# run(3)',
      '',
      'run(4)',
      'jump()',
      'run(4)',
      'jump()',
      'run(10)'
    ].join('\n')
  );

  // Physics & input refs
  const xRef = useRef(10);
  const yRef = useRef(0);
  const velocityYRef = useRef(0);
  const onGroundRef = useRef(true);
  const keysRef = useRef({ left: false, right: false });
  const gameOverRef = useRef(false);
  const hasWonRef = useRef(false);
  const rewardGivenRef = useRef(false);
  const modeRef = useRef<GameMode>('code');
  const levelRef = useRef(1);

  // Script control refs
  const scriptActionsRef = useRef<ScriptAction[]>([]);
  const currentActionIndexRef = useRef(0);
  const isRunningScriptRef = useRef(false);
  const jumpStartedRef = useRef(false);
  const waitTimeLeftRef = useRef(0);
  const targetRunXRef = useRef<number | null>(null);

  // Sync flags
  useEffect(() => {
    gameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    hasWonRef.current = hasWon;
  }, [hasWon]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    isRunningScriptRef.current = isRunningScript;
  }, [isRunningScript]);

  useEffect(() => {
    levelRef.current = currentLevel;
  }, [currentLevel]);

  const resetGameForLevel = (level: number) => {
    const index = Math.max(0, Math.min(LEVELS.length - 1, level - 1));
    const cfg = LEVELS[index];

    xRef.current = 10;
    yRef.current = 0;
    velocityYRef.current = 0;
    onGroundRef.current = true;
    setRenderX(10);
    setRenderY(0);
    setCoins(cfg.coins.map(c => ({ ...c, collected: false })));
    setCollectedCount(0);
    setIsGameOver(false);
    setHasWon(false);
    setIsRunningScript(false);
    rewardGivenRef.current = false;
    scriptActionsRef.current = [];
    currentActionIndexRef.current = 0;
    jumpStartedRef.current = false;
    waitTimeLeftRef.current = 0;
    targetRunXRef.current = null;
    setStatusMessage(null);
    setStatusType(null);
  };

  const resetGame = () => {
    resetGameForLevel(levelRef.current);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingInField =
        tag === 'input' ||
        tag === 'textarea' ||
        (target && (target as HTMLElement).isContentEditable);

      // Never hijack keys while the user is typing in an input/textarea/editor
      if (isTypingInField) {
        return;
      }

      // In code mode we only listen for restart (R); movement comes from the script
      if (modeRef.current === 'code') {
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          resetGame();
        }
        return;
      }

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
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingInField =
        tag === 'input' ||
        tag === 'textarea' ||
        (target && (target as HTMLElement).isContentEditable);

      if (isTypingInField) {
        return;
      }

      if (modeRef.current === 'code') {
        return;
      }
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
      const levelIndex = Math.max(0, Math.min(LEVELS.length - 1, levelRef.current - 1));
      const levelConfig = LEVELS[levelIndex];
      const platforms = levelConfig.platforms || [];
      const levelObstacles = levelConfig.obstacles;

      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.04); // clamp for safety
      lastTime = time;

      if (!gameOverRef.current && !hasWonRef.current) {
        let x = xRef.current;
        let y = yRef.current;
        let vy = velocityYRef.current;
        const prevY = y;

        const currentMode = modeRef.current;

        // Horizontal movement
        let moveDir = 0;
        if (currentMode === 'play') {
          moveDir = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
        } else if (currentMode === 'code' && isRunningScriptRef.current) {
          const actions = scriptActionsRef.current;
          const index = currentActionIndexRef.current;

          if (index < actions.length) {
            const action = actions[index];

            if (action.type === 'wait') {
              if (waitTimeLeftRef.current <= 0) {
                waitTimeLeftRef.current = action.seconds;
              }
              waitTimeLeftRef.current -= deltaSeconds;
              if (waitTimeLeftRef.current <= 0) {
                currentActionIndexRef.current += 1;
                waitTimeLeftRef.current = 0;
              }
            } else if (action.type === 'run') {
              if (targetRunXRef.current == null) {
                const stepSize = 6; // world units per "step"
                targetRunXRef.current = Math.min(
                  WORLD_WIDTH - CHARACTER_WIDTH / 2,
                  Math.max(CHARACTER_WIDTH / 2, x + action.steps * stepSize)
                );
              }
              if (targetRunXRef.current !== null) {
                if (Math.abs(targetRunXRef.current - x) < 0.5) {
                  x = targetRunXRef.current;
                  targetRunXRef.current = null;
                  currentActionIndexRef.current += 1;
                } else {
                  moveDir = targetRunXRef.current > x ? 1 : -1;
                }
              }
            } else if (action.type === 'jump') {
              if (!jumpStartedRef.current && onGroundRef.current) {
                vy = JUMP_VELOCITY;
                jumpStartedRef.current = true;
                onGroundRef.current = false;
              } else if (jumpStartedRef.current && onGroundRef.current) {
                // Landed after jump, move to next action
                jumpStartedRef.current = false;
                currentActionIndexRef.current += 1;
              }
            }
          } else {
            // No more actions – stop script
            isRunningScriptRef.current = false;
            setIsRunningScript(false);
            if (!hasWonRef.current && !gameOverRef.current) {
              setStatusMessage('Program finished! Adjust your steps or jumps and try again.');
              setStatusType('error');
            }
          }
        }

        x += moveDir * MOVE_SPEED * deltaSeconds;
        x = Math.max(0 + CHARACTER_WIDTH / 2, Math.min(WORLD_WIDTH - CHARACTER_WIDTH / 2, x));

        // Vertical physics
        vy += GRAVITY * deltaSeconds;
        y += vy * deltaSeconds;
        let onSurface = false;

        // Landing on platforms (only when moving downward)
        if (vy < 0 && platforms.length > 0) {
          const charLeft = x - CHARACTER_WIDTH / 2;
          const charRight = x + CHARACTER_WIDTH / 2;

          for (const platform of platforms) {
            const platLeft = platform.x;
            const platRight = platform.x + platform.width;
            const top = platform.top;
            const horizontalOverlap = charRight > platLeft && charLeft < platRight;

            if (horizontalOverlap && prevY >= top && y <= top) {
              y = top;
              vy = 0;
              onSurface = true;
              onGroundRef.current = true;
              break;
            }
          }
        }

        // Ground
        if (!onSurface) {
          if (y <= GROUND_Y) {
            y = GROUND_Y;
            vy = 0;
            onGroundRef.current = true;
          } else {
            onGroundRef.current = false;
          }
        }

        // Collision with obstacles (simple AABB check near ground)
        const charLeft = x - CHARACTER_WIDTH / 2;
        const charRight = x + CHARACTER_WIDTH / 2;
        const charHeight = 16 + y; // approx height used for collision

        for (const obstacle of levelObstacles) {
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

          const totalCollected = collectedTotal;
          const allCoinsCollected = totalCollected === totalCoins;

          setStatusMessage(
            allCoinsCollected
              ? `You reached the flag and collected all ${totalCollected} coins! 🎉`
              : `You reached the flag and collected ${totalCollected} coin(s)!`
          );
          setStatusType('success');

          if (!rewardGivenRef.current) {
            rewardGivenRef.current = true;
            // Reward the player once per run
            addCoins(40);
            addExperience(80);
            addPoints(120);
          }

          // Advance to next level after a short pause, if any levels remain
          const nextLevel = levelRef.current + 1;
          if (nextLevel <= LEVELS.length) {
            setTimeout(() => {
              setCurrentLevel(nextLevel);
              resetGameForLevel(nextLevel);
              hasWonRef.current = false;
              setHasWon(false);
            }, 1800);
          } else {
            setTimeout(() => {
              setStatusMessage('You beat all the Side Scroller levels! 🎉');
            }, 1800);
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

  // Parse and start script in code mode
  const runScript = () => {
    resetGame();
    const lines = codeText.split('\n');
    const actions: ScriptAction[] = [];
    let lineNumber = 0;

    for (const rawLine of lines) {
      lineNumber += 1;
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const runMatch = line.match(/^run\((\d+)\)\s*$/i);
      if (runMatch) {
        const steps = parseInt(runMatch[1], 10);
        if (steps <= 0) {
          setStatusMessage(`Line ${lineNumber}: run() needs a positive number of steps.`);
          setStatusType('error');
          return;
        }
        actions.push({ type: 'run', steps });
        continue;
      }

      if (/^jump\(\)\s*$/i.test(line)) {
        actions.push({ type: 'jump' });
        continue;
      }

      const waitMatch = line.match(/^wait\((\d+(\.\d+)?)\)\s*$/i);
      if (waitMatch) {
        const seconds = parseFloat(waitMatch[1]);
        if (seconds < 0) {
          setStatusMessage(`Line ${lineNumber}: wait() cannot be negative.`);
          setStatusType('error');
          return;
        }
        actions.push({ type: 'wait', seconds });
        continue;
      }

      setStatusMessage(`I don't understand line ${lineNumber}: "${line}". Try run(3), jump(), or wait(1).`);
      setStatusType('error');
      return;
    }

    if (actions.length === 0) {
      setStatusMessage('Add some commands first (like run(3) or jump()).');
      setStatusType('error');
      return;
    }

    scriptActionsRef.current = actions;
    currentActionIndexRef.current = 0;
    isRunningScriptRef.current = true;
    setIsRunningScript(true);
    setStatusMessage('Running your program...');
    setStatusType(null);
  };

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

  const levelIndexForRender = Math.max(0, Math.min(LEVELS.length - 1, currentLevel - 1));
  const currentLevelConfig = LEVELS[levelIndexForRender];

  // Helpers for mobile controls
  const pressLeft = () => {
    if (modeRef.current === 'code') return;
    keysRef.current.left = true;
    setTimeout(() => {
      keysRef.current.left = false;
    }, 150);
  };

  const pressRight = () => {
    if (modeRef.current === 'code') return;
    keysRef.current.right = true;
    setTimeout(() => {
      keysRef.current.right = false;
    }, 150);
  };

  const pressJump = () => {
    if (modeRef.current === 'code') {
      // In code mode, jump is controlled by the script
      return;
    }
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
                <span>🎯 Level {currentLevel} / {LEVELS.length}</span>
              </div>
            </div>
          </header>

          <main className="side-scroller-main">
            <section className="side-scroller-game-card">
              <div className="side-scroller-mode-toggle" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>{mode === 'code' ? 'Code Mode' : 'Free Play Mode'}</strong>{' '}
                  {mode === 'code'
                    ? '- write commands to control your run.'
                    : '- use keys or buttons to control your character.'}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '4px', marginRight: '4px' }}>
                    {LEVELS.map(level => (
                      <button
                        key={level.id}
                        type="button"
                        className="side-scroller-btn secondary"
                        style={
                          currentLevel === level.id
                            ? { opacity: 1 }
                            : { opacity: 0.6 }
                        }
                        onClick={() => {
                          setCurrentLevel(level.id);
                          resetGameForLevel(level.id);
                        }}
                      >
                        Lv {level.id}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="side-scroller-btn"
                    style={mode === 'code' ? { opacity: 1 } : { opacity: 0.6 }}
                    onClick={() => {
                      setMode('code');
                      resetGame();
                    }}
                  >
                    💻 Code My Run
                  </button>
                  <button
                    type="button"
                    className="side-scroller-btn secondary"
                    style={mode === 'play' ? { opacity: 1 } : { opacity: 0.6 }}
                    onClick={() => {
                      setMode('play');
                      resetGame();
                    }}
                  >
                    🎮 Free Run
                  </button>
                </div>
              </div>

              <div className="side-scroller-instructions">
                <h2>How to Play</h2>
                <ul>
                  {mode === 'play' ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <li>Write a short “program” that tells your character how to run.</li>
                      <li>
                        Use commands like <code>run(3)</code>, <code>jump()</code>, and{' '}
                        <code>wait(1)</code>. Each command goes on its own line.
                      </li>
                      <li>
                        Click <strong>Run Program</strong> to watch your character follow your code from start to
                        finish.
                      </li>
                      <li>Collect coins and reach the flag using as few commands as you can!</li>
                    </>
                  )}
                </ul>
              </div>

              {mode === 'code' && (
                <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>Command Editor</h3>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="side-scroller-btn secondary"
                          onClick={() => setCodeText(prev => prev + '\nrun(3)')}
                        >
                          + run(3)
                        </button>
                        <button
                          type="button"
                          className="side-scroller-btn secondary"
                          onClick={() => setCodeText(prev => prev + '\njump()')}
                        >
                          + jump()
                        </button>
                        <button
                          type="button"
                          className="side-scroller-btn secondary"
                          onClick={() => setCodeText(prev => prev + '\nwait(1)')}
                        >
                          + wait(1)
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={codeText}
                      onChange={e => setCodeText(e.target.value)}
                      spellCheck={false}
                      style={{
                        width: '100%',
                        minHeight: '110px',
                        borderRadius: '10px',
                        border: '1px solid #bdc3c7',
                        padding: '8px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>Commands you can use</h3>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.4 }}>
                      <li>
                        <code>run(3)</code> – move forward 3 steps.
                      </li>
                      <li>
                        <code>jump()</code> – jump once (use before an obstacle or gap).
                      </li>
                      <li>
                        <code>wait(1)</code> – pause for 1 second before the next command.
                      </li>
                      <li>Put one command on each line.</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="side-scroller-world">
                {/* Platforms */}
                {(currentLevelConfig.platforms || []).map((platform, index) => (
                  <div
                    key={index}
                    className="side-scroller-platform"
                    style={{
                      left: `${platform.x}%`,
                      bottom: `${60 + platform.top - platform.thickness}px`,
                      height: `${platform.thickness}px`,
                      width: `${platform.width}%`
                    }}
                  />
                ))}
                {/* Character */}
                <div
                  className="side-scroller-character"
                  style={{
                    left: `${renderX}%`,
                    // Positive renderY = jumping up, so we move visually upward with a negative translateY
                    transform: `translate(-50%, ${-renderY}px)`
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
                {currentLevelConfig.obstacles.map((obstacle, index) => (
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
                    {!isGameOver &&
                      !hasWon &&
                      (mode === 'play'
                        ? 'Run, jump, and reach the flag!'
                        : 'Write your program, then click Run Program.')}
                  </span>
                </div>
                <div className="side-scroller-controls">
                  {mode === 'code' ? (
                    <>
                      <button
                        type="button"
                        className="side-scroller-btn"
                        onClick={runScript}
                        disabled={isRunningScript}
                      >
                        ▶ Run Program
                      </button>
                      <button
                        type="button"
                        className="side-scroller-btn secondary"
                        onClick={resetGame}
                        disabled={isRunningScript}
                      >
                        🔁 Reset
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="side-scroller-btn secondary"
                      onClick={resetGame}
                    >
                      🔁 Play Again
                    </button>
                  )}
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

