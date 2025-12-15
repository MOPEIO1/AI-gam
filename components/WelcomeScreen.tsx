import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onStart }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer" onClick={onStart}>
      {/* Mystical Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop')] bg-cover bg-center opacity-20 animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
      
      {/* Particle Effects (CSS only for performance) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75 duration-1000" />
        <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-50 duration-[2000ms]" />
        <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-75 duration-[1500ms]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center p-8">
        <div className="mb-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <span className="inline-block py-1 px-3 rounded-full bg-slate-900/50 border border-slate-700 text-cyan-400 text-xs font-mono uppercase tracking-[0.2em] mb-4">
             v0.6.0 &bull; Destiny Awaits
           </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-fantasy text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-cyan-100 to-slate-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.3)] mb-6 animate-in zoom-in duration-1000">
          Celestial<br/>Ascension
        </h1>

        <p className="max-w-xl text-slate-400 text-lg md:text-xl font-serif leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 delay-500 duration-1000">
          From the dust of the mortal realm, a legend rises.<br/>
          Will you cultivate your essence and challenge the heavens?
        </p>

        <div className={`transition-all duration-1000 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button 
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105"
            onClick={(e) => { e.stopPropagation(); onStart(); }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 border border-slate-600 rounded-full group-hover:border-cyan-400/50 transition-colors" />
            <div className="absolute inset-0 blur-md bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <span className="relative z-10 font-fantasy text-xl text-slate-200 group-hover:text-white flex items-center gap-3">
               Begin Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <p className="mt-4 text-xs text-slate-600 font-mono animate-pulse">
            Press anywhere to start
          </p>
        </div>
      </div>
    </div>
  );
};