import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const GAME_SPEED = 100;

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIR = { x: 0, y: -1 };

export default function SnakeGame({ onScoreChange }: { onScoreChange: (s: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [shake, setShake] = useState(false);
  
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const dirRef = useRef<Point>(INITIAL_DIR);
  const nextDirRef = useRef<Point>(INITIAL_DIR);
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const particlesRef = useRef<Particle[]>([]);
  const lastTickRef = useRef(0);
  const reqRef = useRef<number>();

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        color
      });
    }
  };

  const reset = () => {
    snakeRef.current = [...INITIAL_SNAKE];
    dirRef.current = { ...INITIAL_DIR };
    nextDirRef.current = { ...INITIAL_DIR };
    foodRef.current = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    particlesRef.current = [];
    onScoreChange(0);
    setGameState('PLAYING');
  };

  const triggerGameOver = () => {
    setGameState('GAME_OVER');
    setShake(true);
    setTimeout(() => setShake(false), 400);
    spawnParticles(snakeRef.current[0].x, snakeRef.current[0].y, '#ff00ff');
  };

  const update = useCallback((time: number) => {
    if (gameState !== 'PLAYING') {
      draw();
      reqRef.current = requestAnimationFrame(update);
      return;
    }

    if (time - lastTickRef.current > GAME_SPEED) {
      lastTickRef.current = time;
      dirRef.current = nextDirRef.current;
      
      const head = snakeRef.current[0];
      const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

      // Wall Collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        triggerGameOver();
        return;
      }

      // Self Collision
      if (snakeRef.current.some(s => s.x === newHead.x && s.y === newHead.y)) {
        triggerGameOver();
        return;
      }

      snakeRef.current.unshift(newHead);

      // Food Collision
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        spawnParticles(foodRef.current.x, foodRef.current.y, '#00ffff');
        onScoreChange(snakeRef.current.length - INITIAL_SNAKE.length);
        let newFood;
        while (true) {
          newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
          // eslint-disable-next-line no-loop-func
          if (!snakeRef.current.some(s => s.x === newFood.x && s.y === newFood.y)) break;
        }
        foodRef.current = newFood;
      } else {
        snakeRef.current.pop();
      }
    }

    // Update particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    draw();
    reqRef.current = requestAnimationFrame(update);
  }, [gameState]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid (Glitchy/Tech vibe)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillRect(foodRef.current.x * CELL_SIZE + 2, foodRef.current.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.shadowBlur = 0;

    // Draw Snake
    snakeRef.current.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#ffffff' : '#00ffff';
      ctx.shadowBlur = i === 0 ? 20 : 10;
      ctx.shadowColor = '#00ffff';
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      ctx.shadowBlur = 0;
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;
  };

  useEffect(() => {
    reqRef.current = requestAnimationFrame(update);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      
      if (gameState !== 'PLAYING') {
        if (e.key === ' ') reset();
        return;
      }

      const { x, y } = dirRef.current;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': if (y !== 1) nextDirRef.current = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': case 'S': if (y !== -1) nextDirRef.current = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': case 'A': if (x !== 1) nextDirRef.current = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': case 'D': if (x !== -1) nextDirRef.current = { x: 1, y: 0 }; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className={`relative border-4 border-cyan p-1 bg-black ${shake ? 'shake' : ''}`}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full max-w-[500px] aspect-square block"
        style={{ imageRendering: 'pixelated' }}
      />
      {gameState !== 'PLAYING' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
          <h2 className="text-4xl md:text-5xl font-pixel text-magenta mb-4 glitch-text" data-text={gameState === 'IDLE' ? 'SYSTEM_READY' : 'FATAL_ERROR'}>
            {gameState === 'IDLE' ? 'SYSTEM_READY' : 'FATAL_ERROR'}
          </h2>
          <p className="text-cyan text-2xl animate-pulse font-sys uppercase">PRESS [SPACE] TO EXECUTE</p>
        </div>
      )}
    </div>
  );
}
