import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { title: "AUDIO_STREAM_01.DAT", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "AUDIO_STREAM_02.DAT", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "AUDIO_STREAM_03.DAT", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function MusicPlayer() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, idx]);

  const next = () => {
    setIdx((i) => (i + 1) % TRACKS.length);
    setPlaying(true);
  };

  const prev = () => {
    setIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length);
    setPlaying(true);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-black border-2 border-magenta p-4 w-full shadow-[0_0_15px_rgba(255,0,255,0.3)]">
      <div className="flex flex-col mb-4 md:mb-0">
        <span className="text-cyan text-xl uppercase tracking-widest">{">>"} AUDIO_SUBSYSTEM</span>
        <span className="text-magenta font-pixel text-lg mt-2 glitch-text" data-text={TRACKS[idx].title}>
          {TRACKS[idx].title}
        </span>
      </div>
      
      <audio
        ref={audioRef}
        src={TRACKS[idx].url}
        onEnded={next}
      />

      <div className="flex items-center gap-4">
        <button 
          onClick={prev} 
          className="px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-black transition-colors font-pixel text-xs cursor-pointer"
        >
          [PREV]
        </button>
        <button 
          onClick={() => setPlaying(!playing)} 
          className="px-6 py-2 border-2 border-magenta text-magenta hover:bg-magenta hover:text-black transition-colors font-pixel text-sm cursor-pointer"
        >
          {playing ? 'HALT' : 'EXEC'}
        </button>
        <button 
          onClick={next} 
          className="px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-black transition-colors font-pixel text-xs cursor-pointer"
        >
          [NEXT]
        </button>
      </div>
    </div>
  );
}
