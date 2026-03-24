import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-4 relative font-sys selection:bg-magenta selection:text-black">
      {/* CRT Overlays */}
      <div className="static-noise"></div>
      <div className="scanlines"></div>

      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mt-4 z-10 border-b-4 border-magenta pb-4">
        <h1 className="text-4xl md:text-5xl font-pixel glitch-text text-cyan uppercase tracking-tighter" data-text="SYS.SNAKE_PROTOCOL">
          SYS.SNAKE_PROTOCOL
        </h1>
        
        <div className="flex flex-col items-end mt-4 md:mt-0">
          <span className="text-magenta text-2xl uppercase tracking-widest">DATA_COLLECTED</span>
          <span className="text-4xl font-pixel text-cyan">{score.toString().padStart(4, '0')}</span>
        </div>
      </header>

      {/* Main Content - Game */}
      <main className="flex-1 flex items-center justify-center w-full my-8 z-10">
        <SnakeGame onScoreChange={setScore} />
      </main>

      {/* Footer - Music Player */}
      <footer className="w-full max-w-4xl mt-auto z-10 border-t-4 border-cyan pt-4">
        <MusicPlayer />
      </footer>
      
    </div>
  );
}
