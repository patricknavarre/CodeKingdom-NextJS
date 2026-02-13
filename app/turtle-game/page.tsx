'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/TurtleGamePage.css';

const CANVAS_SIZE = 500;

const TURTLE_EXAMPLES: { id: string; label: string; tip?: string; code: string }[] = [
  { id: 'square', label: 'Square', tip: 'Turn 90° after each side.', code: `forward(100)
right(90)
forward(100)
right(90)
forward(100)
right(90)
forward(100)` },
  { id: 'triangle', label: 'Triangle', tip: 'Turn 120° to make three equal sides.', code: `forward(120)
right(120)
forward(120)
right(120)
forward(120)` },
  { id: 'star', label: 'Star', tip: 'Five lines, turn 144° each time.', code: `forward(150)
right(144)
forward(150)
right(144)
forward(150)
right(144)
forward(150)
right(144)
forward(150)` },
  { id: 'hexagon', label: 'Hexagon', tip: 'Six sides, turn 60° each.', code: `forward(80)
right(60)
forward(80)
right(60)
forward(80)
right(60)
forward(80)
right(60)
forward(80)
right(60)
forward(80)` },
  { id: 'house', label: 'House', tip: 'Square base, then goto() for the roof.', code: `forward(50)
right(90)
forward(50)
right(90)
forward(50)
right(90)
forward(50)
right(90)
goto(0, 50)
goto(25, 80)
goto(50, 50)` },
  { id: 'flower', label: 'Flower', tip: 'Six petals: forward, backward, turn 60°.', code: `forward(50)
backward(50)
right(60)
forward(50)
backward(50)
right(60)
forward(50)
backward(50)
right(60)
forward(50)
backward(50)
right(60)
forward(50)
backward(50)
right(60)
forward(50)
backward(50)` },
  { id: 'colorful-star', label: 'Colorful star', tip: 'Change color() before each segment.', code: `color("red")
forward(150)
right(144)
color("blue")
forward(150)
right(144)
color("green")
forward(150)
right(144)
color("orange")
forward(150)
right(144)
color("purple")
forward(150)` },
];

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
  orange: '#e67e22',
  purple: '#9b59b6',
  pink: '#e91e63',
  white: '#ffffff',
  brown: '#795548',
};

function parseAngle(deg: number): number {
  return (deg * Math.PI) / 180;
}

type TurtleState = { x: number; y: number; angle: number; penDown: boolean; color: string };
type Segment = { from: { x: number; y: number }; to: { x: number; y: number }; color: string };

function applyLine(line: string, state: TurtleState): { newState: TurtleState; segment?: Segment } {
  const forwardMatch = line.match(/^(?:forward|fd)\s*\(\s*(\d+)\s*\)/);
  if (forwardMatch) {
    const dist = parseInt(forwardMatch[1], 10);
    const rad = parseAngle(state.angle);
    const nx = state.x + dist * Math.cos(rad);
    const ny = state.y + dist * Math.sin(rad);
    const segment = state.penDown
      ? { from: { x: state.x, y: state.y }, to: { x: nx, y: ny }, color: state.color }
      : undefined;
    return { newState: { ...state, x: nx, y: ny }, segment };
  }

  const backwardMatch = line.match(/^(?:backward|bd)\s*\(\s*(\d+)\s*\)/);
  if (backwardMatch) {
    const dist = parseInt(backwardMatch[1], 10);
    const rad = parseAngle(state.angle);
    const nx = state.x - dist * Math.cos(rad);
    const ny = state.y - dist * Math.sin(rad);
    const segment = state.penDown
      ? { from: { x: state.x, y: state.y }, to: { x: nx, y: ny }, color: state.color }
      : undefined;
    return { newState: { ...state, x: nx, y: ny }, segment };
  }

  const rightMatch = line.match(/^(?:right|rt)\s*\(\s*(\d+)\s*\)/);
  if (rightMatch) {
    return { newState: { ...state, angle: state.angle + parseInt(rightMatch[1], 10) } };
  }

  const leftMatch = line.match(/^(?:left|lt)\s*\(\s*(\d+)\s*\)/);
  if (leftMatch) {
    return { newState: { ...state, angle: state.angle - parseInt(leftMatch[1], 10) } };
  }

  if (line.match(/^(?:penup|pu)\s*\(\s*\)/)) {
    return { newState: { ...state, penDown: false } };
  }

  if (line.match(/^(?:pendown|pd)\s*\(\s*\)/)) {
    return { newState: { ...state, penDown: true } };
  }

  const colorMatch = line.match(/color\s*\(\s*["'](\w+)["']\s*\)/);
  if (colorMatch) {
    const name = colorMatch[1].toLowerCase();
    return { newState: { ...state, color: COLOR_MAP[name] ?? state.color } };
  }

  const gotoMatch = line.match(/goto\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/);
  if (gotoMatch) {
    const nx = parseInt(gotoMatch[1], 10);
    const ny = parseInt(gotoMatch[2], 10);
    const segment = state.penDown
      ? { from: { x: state.x, y: state.y }, to: { x: nx, y: ny }, color: state.color }
      : undefined;
    return { newState: { ...state, x: nx, y: ny }, segment };
  }

  return { newState: state };
}

function drawSegmentsAndTurtle(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  state: TurtleState,
  width: number,
  height: number
) {
  const cx = width / 2;
  const cy = height / 2;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.setTransform(1, 0, 0, -1, cx, cy);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  for (const seg of segments) {
    ctx.strokeStyle = seg.color;
    ctx.beginPath();
    ctx.moveTo(seg.from.x, seg.from.y);
    ctx.lineTo(seg.to.x, seg.to.y);
    ctx.stroke();
  }

  const bodyRadius = 10;
  const headLen = 12;
  ctx.translate(state.x, state.y);
  ctx.rotate(parseAngle(state.angle));
  ctx.fillStyle = '#2e7d32';
  ctx.strokeStyle = '#1b5e20';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headLen, 0);
  ctx.lineTo(-4, 6);
  ctx.lineTo(-4, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

const DRAW_STEP_MS = 120;

export default function TurtleGamePage() {
  const { authState } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationCancelledRef = useRef(false);
  const [code, setCode] = useState(`# Turtle drawing - try these commands!
forward(100)
right(90)
forward(100)
right(90)
forward(100)
right(90)
forward(100)
`);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [executing, setExecuting] = useState(false);
  const [showTipsOpen, setShowTipsOpen] = useState(false);
  const [copiedExampleId, setCopiedExampleId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setExecuting(true);
    setMessage('');
    setMessageType('success');
    animationCancelledRef.current = false;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setMessage('Canvas not available');
      setMessageType('error');
      setExecuting(false);
      return;
    }

    const lines = code.split('\n');
    let state: TurtleState = {
      x: 0,
      y: 0,
      angle: 90,
      penDown: true,
      color: '#000000',
    };
    const segments: Segment[] = [];

    try {
      for (let i = 0; i < lines.length; i++) {
        if (animationCancelledRef.current) break;
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        const result = applyLine(line, state);
        if (result.segment) segments.push(result.segment);
        state = result.newState;
        // Only clear and redraw when something visible changed (new line or turtle turned).
        // Skipping redraw for color/penup/pendown keeps the drawing from flashing or erasing.
        const needRedraw =
          result.segment !== undefined ||
          /^(?:right|rt)\s*\(/.test(line) ||
          /^(?:left|lt)\s*\(/.test(line);
        if (needRedraw) {
          drawSegmentsAndTurtle(ctx, segments, state, CANVAS_SIZE, CANVAS_SIZE);
        }
        await new Promise((r) => setTimeout(r, DRAW_STEP_MS));
      }
      if (!animationCancelledRef.current) setMessage('Drawing complete!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Error drawing');
      setMessageType('error');
    } finally {
      setExecuting(false);
    }
  };

  const clearCanvas = () => {
    animationCancelledRef.current = true;
    setExecuting(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    setCode(`# Turtle drawing
forward(100)
right(90)
forward(100)
right(90)
forward(100)
right(90)
forward(100)
`);
    setMessage('');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const loadExample = (example: typeof TURTLE_EXAMPLES[0]) => {
    setCode(example.code);
  };

  const copyExample = async (example: typeof TURTLE_EXAMPLES[0]) => {
    try {
      await navigator.clipboard.writeText(example.code);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      setCopiedExampleId(example.id);
      copyTimeoutRef.current = setTimeout(() => setCopiedExampleId(null), 2000);
    } catch {
      setMessage('Copy failed');
      setMessageType('error');
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
        <Navigation />
        <div className="turtle-game-page">
          <div className="turtle-game-header">
            <h1>🐢 Turtle Drawing</h1>
          </div>

          <div className="turtle-game-content">
            <div className="turtle-editor-panel">
              <h2>Python Turtle Commands</h2>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                Write turtle commands and click Run to draw. The turtle starts at the center facing up.
              </p>
              <div className="turtle-tips-panel">
                <div
                  className="turtle-tips-header"
                  onClick={() => setShowTipsOpen(!showTipsOpen)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <span>Tips & tricks</span>
                  <span className="turtle-tips-toggle">{showTipsOpen ? '−' : '+'}</span>
                </div>
                {showTipsOpen && (
                  <div className="turtle-tips-content">
                    <p className="turtle-tips-intro">
                      Click a <strong>name</strong> to load that code into the editor, or click <strong>Copy</strong> to copy it. Then click Run to see it draw!
                    </p>
                    <div className="turtle-examples">
                      {TURTLE_EXAMPLES.map((ex) => (
                        <div key={ex.id} className="turtle-example-row">
                          <button
                            type="button"
                            className="turtle-example-btn"
                            onClick={() => loadExample(ex)}
                          >
                            {ex.label}
                          </button>
                          <button
                            type="button"
                            className={`turtle-copy-btn ${copiedExampleId === ex.id ? 'copied' : ''}`}
                            onClick={() => copyExample(ex)}
                          >
                            {copiedExampleId === ex.id ? 'Copied!' : 'Copy'}
                          </button>
                          {ex.tip && <span className="turtle-example-tip">{ex.tip}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <textarea
                className="turtle-code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (!executing) runCode();
                  }
                }}
                placeholder={'forward(100)\nright(90)'}
                spellCheck={false}
              />
              <div className="turtle-editor-actions">
                <button
                  className="turtle-run-btn"
                  onClick={runCode}
                  disabled={executing || !code.trim()}
                >
                  {executing ? 'Drawing...' : '▶ Run'}
                </button>
                <button className="turtle-clear-btn" onClick={clearCanvas}>
                  Clear
                </button>
              </div>
              <div className="turtle-command-reference">
                <h4>Commands</h4>
                <ul>
                  <li><code>forward(n)</code> / <code>fd(n)</code> – move forward n pixels</li>
                  <li><code>backward(n)</code> / <code>bd(n)</code> – move backward</li>
                  <li><code>right(angle)</code> / <code>rt(angle)</code> – turn right (degrees)</li>
                  <li><code>left(angle)</code> / <code>lt(angle)</code> – turn left</li>
                  <li><code>penup()</code> / <code>pu()</code> – stop drawing</li>
                  <li><code>pendown()</code> / <code>pd()</code> – start drawing</li>
                  <li><code>color("red")</code> – set pen color</li>
                  <li><code>goto(x, y)</code> – move to position (x, y)</li>
                </ul>
              </div>
            </div>

            <div className="turtle-canvas-panel">
              <h3>Drawing</h3>
              <div className="turtle-canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                />
              </div>
              {message && (
                <div className={`turtle-message ${messageType}`}>{message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
