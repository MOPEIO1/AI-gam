import React, { useState, useEffect, useRef } from 'react';
import { CultivationStage } from '../types';
import { Sparkles, AlertTriangle, Activity } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';
import { Button } from './Button';

interface Props {
  currentStage: CultivationStage;
  nextStage: CultivationStage;
  onSuccess: () => void;
  onFail: () => void;
}

export const BreakthroughModal: React.FC<Props> = ({ currentStage, nextStage, onSuccess, onFail }) => {
  const [status, setStatus] = useState<'intro' | 'active' | 'success' | 'failed'>('intro');
  const [progress, setProgress] = useState(50); // The Chi Balance (0-100)
  const [instability, setInstability] = useState(0); // Grows over time, makes balancing harder
  const [successTimer, setSuccessTimer] = useState(0); // Must hold balance for X seconds
  const containerRef = useRef<HTMLDivElement>(null);

  // Sound: Start Drone
  useEffect(() => {
    SoundManager.startBreakthroughDrone();
    return () => SoundManager.stopDrone();
  }, []);

  // Game Loop
  useEffect(() => {
    if (status !== 'active') return;

    const interval = setInterval(() => {
      // 1. Natural Decay/Drift (Random chaotic movement)
      const drift = (Math.random() - 0.5) * (2 + instability);
      
      setProgress(p => {
        const next = p + drift;
        if (next <= 0 || next >= 100) {
          handleFail();
        }
        return Math.max(0, Math.min(100, next));
      });

      // 2. Increase Difficulty
      setInstability(i => i + 0.05);

      // 3. Check Success Condition (Must stay in 40-60 range)
      setProgress(currentP => {
         if (currentP > 35 && currentP < 65) {
            setSuccessTimer(t => {
               if (t >= 100) {
                 handleSuccess();
                 return 100;
               }
               return t + 1; // Fill bar
            });
         } else {
            setSuccessTimer(t => Math.max(0, t - 2)); // Decay if out of zone
         }
         return currentP;
      });

    }, 50);

    return () => clearInterval(interval);
  }, [status, instability]);

  const handleStabilize = () => {
    SoundManager.playClick(); // Short burst
    // Push towards center
    setProgress(p => {
       const correction = p < 50 ? 5 : -5;
       return p + correction;
    });
  };

  const handleSuccess = () => {
    setStatus('success');
    SoundManager.stopDrone();
    SoundManager.playBreakthroughBoom();
    setTimeout(onSuccess, 4000); // Allow animation to play
  };

  const handleFail = () => {
    setStatus('failed');
    SoundManager.stopDrone();
    // Play fail sound (reusing mine sound with low pitch for thud)
    SoundManager.playMine(0.2); 
    setTimeout(onFail, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-1000">
      
      {/* Background Pulse */}
      <div className={`absolute inset-0 bg-cyan-500/10 pointer-events-none ${status === 'active' ? 'animate-pulse' : ''}`} />
      
      {status === 'intro' && (
        <div className="max-w-md text-center p-8 border border-cyan-500/50 rounded-2xl bg-slate-900 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
          <h2 className="text-3xl font-fantasy text-cyan-100 mb-2">Realm Breakthrough</h2>
          <div className="text-xl text-slate-400 mb-6 flex items-center justify-center gap-4">
             <span>{currentStage}</span>
             <Activity className="animate-pulse text-cyan-400"/>
             <span className="text-white font-bold">{nextStage}</span>
          </div>
          <p className="text-slate-300 mb-8 italic">
            "To transcend, one must stabilize their Chi amidst the chaos. Keep your energy centered."
          </p>
          <Button 
            className="w-full py-4 text-lg font-fantasy shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            onClick={() => setStatus('active')}
          >
            Begin Ascension
          </Button>
        </div>
      )}

      {status === 'active' && (
        <div className="w-full max-w-lg p-8 relative">
           <h3 className="text-center font-fantasy text-2xl text-cyan-200 mb-8 animate-pulse">Stabilize Your Core</h3>
           
           {/* Success Bar */}
           <div className="w-full h-4 bg-slate-800 rounded-full mb-2 overflow-hidden border border-slate-600">
              <div 
                 className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-100"
                 style={{ width: `${successTimer}%` }}
              />
           </div>
           <div className="text-center text-xs text-slate-400 mb-8">Ascension Progress</div>

           {/* The Balance Gauge */}
           <div className="relative h-20 bg-slate-900 border-2 border-slate-600 rounded-full overflow-hidden shadow-inner">
              {/* Safe Zone */}
              <div className="absolute top-0 bottom-0 left-[35%] right-[35%] bg-green-500/20 border-l border-r border-green-500/50 z-0">
                 <div className="text-center text-green-500/50 text-xs mt-2 font-mono">SAFE ZONE</div>
              </div>

              {/* Cursor */}
              <div 
                className="absolute top-0 bottom-0 w-4 bg-white shadow-[0_0_20px_white] z-10 transition-all duration-75 ease-linear"
                style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
              />
           </div>

           <div className="mt-12 text-center">
              <button
                className="w-32 h-32 rounded-full bg-cyan-900/50 border-4 border-cyan-500/50 text-cyan-100 font-bold text-xl active:scale-95 active:bg-cyan-500 active:text-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                onClick={handleStabilize}
              >
                STABILIZE
              </button>
              <p className="mt-4 text-slate-500 text-sm">Tap repeatedly to counter the drift!</p>
           </div>
        </div>
      )}

      {status === 'success' && (
         <div className="flex flex-col items-center animate-in zoom-in duration-1000">
            <div className="w-64 h-64 rounded-full bg-white animate-[ping_1s_ease-out_infinite] absolute opacity-20" />
            <div className="relative z-10 text-center">
               <h1 className="text-6xl font-fantasy text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]">
                  BREAKTHROUGH
               </h1>
               <p className="text-2xl text-cyan-100 mt-4 font-serif">You have reached the {nextStage}.</p>
            </div>
         </div>
      )}

      {status === 'failed' && (
         <div className="text-center animate-in shake duration-300">
            <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h2 className="text-4xl font-fantasy text-red-500">FAILURE</h2>
            <p className="text-slate-400 mt-2">Your foundation was unstable. The backlash injures you.</p>
         </div>
      )}
    </div>
  );
};