'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/TurtleGamePage.css';

const CANVAS_SIZE = 500;

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

export default function TurtleGamePage() {
  const { authState } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const drawTurtle = (
    ctx: CanvasRenderingContext2D,
    lines: string[],
    width: number,
    height: number
  ) => {
    const cx = width / 2;
    const cy = height / 2;
    ctx.save();
    ctx.setTransform(1, 0, 0, -1, cx, cy);

    let x = 0;
    let y = 0;
    let angle = 90;
    let penDown = true;
    let color = '#000000';

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const forwardMatch = line.match(/^(?:forward|fd)\s*\(\s*(\d+)\s*\)/);
      if (forwardMatch) {
        const dist = parseInt(forwardMatch[1], 10);
        const rad = parseAngle(angle);
        const nx = x + dist * Math.cos(rad);
        const ny = y + dist * Math.sin(rad);
        if (penDown) {
          ctx.strokeStyle = color;
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nx, ny);
        }
        x = nx;
        y = ny;
        continue;
      }

      const backwardMatch = line.match(/^(?:backward|bd)\s*\(\s*(\d+)\s*\)/);
      if (backwardMatch) {
        const dist = parseInt(backwardMatch[1], 10);
        const rad = parseAngle(angle);
        const nx = x - dist * Math.cos(rad);
        const ny = y - dist * Math.sin(rad);
        if (penDown) {
          ctx.strokeStyle = color;
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nx, ny);
        }
        x = nx;
        y = ny;
        continue;
      }

      const rightMatch = line.match(/^(?:right|rt)\s*\(\s*(\d+)\s*\)/);
      if (rightMatch) {
        angle += parseInt(rightMatch[1], 10);
        continue;
      }

      const leftMatch = line.match(/^(?:left|lt)\s*\(\s*(\d+)\s*\)/);
      if (leftMatch) {
        angle -= parseInt(leftMatch[1], 10);
        continue;
      }

      if (line.match(/^(?:penup|pu)\s*\(\s*\)/)) {
        penDown = false;
        continue;
      }

      if (line.match(/^(?:pendown|pd)\s*\(\s*\)/)) {
        penDown = true;
        ctx.beginPath();
        ctx.moveTo(x, y);
        continue;
      }

      const colorMatch = line.match(/color\s*\(\s*["'](\w+)["']\s*\)/);
      if (colorMatch) {
        const name = colorMatch[1].toLowerCase();
        color = COLOR_MAP[name] ?? color;
        ctx.strokeStyle = color;
        continue;
      }

      const gotoMatch = line.match(/goto\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/);
      if (gotoMatch) {
        const nx = parseInt(gotoMatch[1], 10);
        const ny = parseInt(gotoMatch[2], 10);
        if (penDown) {
          ctx.strokeStyle = color;
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nx, ny);
        }
        x = nx;
        y = ny;
        continue;
      }
    }

    ctx.restore();
  };

  const runCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setExecuting(true);
    setMessage('');
    setMessageType('success');

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setMessage('Canvas not available');
      setMessageType('error');
      setExecuting(false);
      return;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.restore();

    const lines = code.split('\n');
    try {
      drawTurtle(ctx, lines, CANVAS_SIZE, CANVAS_SIZE);
      setMessage('Drawing complete!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Error drawing');
      setMessageType('error');
    }
    setExecuting(false);
  };

  const clearCanvas = () => {
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
