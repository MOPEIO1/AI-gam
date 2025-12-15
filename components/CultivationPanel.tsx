import React, { useState, useEffect } from 'react';
import { Activity, Zap, Shield, Eye, Dumbbell, Sparkles, Brain, Clover, Hourglass, ArrowUpCircle } from 'lucide-react';
import { Attribute, PlayerStats, ActiveBuff } from '../types';
import { Button } from './Button';
import { CharacterAvatar } from './CharacterAvatar';
import { SoundManager } from '../utils/SoundManager';

interface Props {
  stats: PlayerStats;
  potential: number;
  maxPotential: number;
  activeBuff: ActiveBuff | null;
  onMeditate: (buff: ActiveBuff) => void;
}

export const CultivationPanel: React.FC<Props> = ({ stats, potential, maxPotential, activeBuff, onMeditate }) => {
  const [meditating, setMeditating] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [puzzleTarget, setPuzzleTarget] = useState<typeof mantras[0] | null>(null);
  const [puzzleStep, setPuzzleStep] = useState(0);
  const [puzzleSequence, setPuzzleSequence] = useState<number[]>([]);

  // Update timer for active buff
  useEffect(() => {
    if (!activeBuff) {
      setTimeLeft(0);
      return;
    }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((activeBuff.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBuff]);

  const mantras = [
    {
      id: 'iron_body',
      name: "Iron Body Mantra",
      desc: "Focuses Chi into the muscles and skin.",
      effect: "2x Strength & Endurance Gain",
      stats: [Attribute.Strength, Attribute.Endurance],
      icon: <Shield className="w-5 h-5 text-orange-400" />,
      color: "border-orange-500/50 bg-orange-950/20"
    },
    {
      id: 'cloud_step',
      name: "Cloud Step Meditation",
      desc: "Lightens the body and sharpens reflexes.",
      effect: "2x Agility & Luck Gain",
      stats: [Attribute.Agility, Attribute.Luck],
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      color: "border-yellow-500/50 bg-yellow-950/20"
    },
    {
      id: 'mind_eye',
      name: "Mind's Eye Focus",
      desc: "Expands consciousness beyond the physical.",
      effect: "2x Chi, Int & Perc Gain",
      stats: [Attribute.Chi, Attribute.Intelligence, Attribute.Perception],
      icon: <Eye className="w-5 h-5 text-purple-400" />,
      color: "border-purple-500/50 bg-purple-950/20"
    }
  ];

  const handleStartMeditation = (mantra: typeof mantras[0]) => {
    setPuzzleTarget(mantra);
    setShowPuzzle(true);
    // Generate simple sequence of 4 random points (0-8 for a 3x3 grid)
    setPuzzleSequence(Array.from({length: 4}, () => Math.floor(Math.random() * 9)));
    setPuzzleStep(0);
  };

  const handlePuzzleClick = (index: number) => {
    if (index === puzzleSequence[puzzleStep]) {
        SoundManager.playClick();
        if (puzzleStep === puzzleSequence.length - 1) {
            // Success
            completeMeditation();
        } else {
            setPuzzleStep(s => s + 1);
        }
    } else {
        // Fail - Reset
        setPuzzleStep(0);
        // Visual shake logic could go here
    }
  };

  const completeMeditation = async () => {
    if (!puzzleTarget) return;
    setShowPuzzle(false);
    setMeditating(puzzleTarget.id);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newBuff: ActiveBuff = {
      name: puzzleTarget.name,
      description: puzzleTarget.effect,
      multiplier: 2,
      affectedStats: puzzleTarget.stats,
      expiresAt: Date.now() + (60 * 1000) 
    };

    onMeditate(newBuff);
    setMeditating(null);
    setPuzzleTarget(null);
  };

  const getStatIcon = (stat: Attribute) => {
    switch (stat) {
      case Attribute.Strength: return <Dumbbell size={14} className="text-orange-400"/>;
      case Attribute.Agility: return <Zap size={14} className="text-yellow-400"/>;
      case Attribute.Endurance: return <Shield size={14} className="text-green-400"/>;
      case Attribute.Chi: return <Sparkles size={14} className="text-cyan-400"/>;
      case Attribute.Perception: return <Eye size={14} className="text-purple-400"/>;
      case Attribute.Intelligence: return <Brain size={14} className="text-blue-400"/>;
      case Attribute.Luck: return <Clover size={14} className="text-emerald-400"/>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Puzzle Overlay */}
      {showPuzzle && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm">
            <h3 className="text-cyan-300 font-fantasy text-2xl mb-4">Align Your Chi</h3>
            <p className="text-slate-400 text-sm mb-6">Click the glowing points in order to clear your mind.</p>
            <div className="grid grid-cols-3 gap-4">
                {Array.from({length: 9}).map((_, i) => {
                    const isTarget = puzzleSequence[puzzleStep] === i;
                    return (
                        <div 
                            key={i}
                            onClick={() => handlePuzzleClick(i)}
                            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300
                                ${isTarget ? 'border-cyan-400 bg-cyan-900/50 animate-pulse' : 'border-slate-700 bg-slate-800'}`}
                        >
                            {isTarget && <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_currentColor]" />}
                        </div>
                    )
                })}
            </div>
            <button onClick={() => setShowPuzzle(false)} className="mt-8 text-slate-500 hover:text-slate-300">Cancel</button>
        </div>
      )}

      {/* Left Column: Character Visual */}
      <div className="w-full lg:w-1/3 flex flex-col items-center justify-start pt-4">
         <div className="sticky top-4 w-full flex flex-col items-center">
            <CharacterAvatar stats={stats} isAwakened={potential >= maxPotential} size="xl" />
            
            {/* Active Buff Display */}
            <div className={`mt-6 w-full p-4 rounded-xl border transition-all ${activeBuff ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900/50 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Current State</span>
                {activeBuff && (
                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                    <Hourglass size={12} className="animate-spin-slow" /> {timeLeft}s
                  </span>
                )}
              </div>
              
              {activeBuff ? (
                <div>
                  <div className="font-fantasy text-lg text-cyan-200">{activeBuff.name}</div>
                  <div className="text-xs text-cyan-400/80 mb-2">{activeBuff.description}</div>
                  <div className="flex gap-2">
                    {activeBuff.affectedStats.map(s => (
                       <span key={s} className="px-2 py-0.5 rounded bg-cyan-900/50 border border-cyan-700 text-[10px] text-cyan-300">
                         {s}
                       </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm italic">
                  Mind is wandering. Meditate to focus your growth.
                </div>
              )}
            </div>

            <div className="mt-4 w-full grid grid-cols-2 gap-2">
              {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                  <span className="flex items-center gap-2 text-xs text-slate-400">
                    {getStatIcon(key as Attribute)} {key}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-200">{val}</span>
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* Right Column: Meditation Mantras */}
      <div className="w-full lg:w-2/3 space-y-6">
        <div className="text-left mb-6 border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-fantasy text-cyan-100 mb-2">Meditation Hall</h2>
          <p className="text-slate-400">
            True power comes from action, but wisdom comes from stillness. <br/>
            <span className="text-cyan-400">Meditate to enter a focused state, multiplying the stats you gain from Labor, Exploration, and Practice.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {mantras.map((mantra) => (
            <div 
              key={mantra.id} 
              className={`p-6 rounded-xl border transition-all relative overflow-hidden group hover:scale-[1.01] ${mantra.color}`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 shadow-lg h-fit">
                    {mantra.icon}
                  </div>
                  <div>
                    <h3 className="font-fantasy text-xl font-bold text-slate-200 group-hover:text-white transition-colors">
                      {mantra.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-2">{mantra.desc}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs font-mono text-cyan-300">
                      <ArrowUpCircle size={12} /> {mantra.effect}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Button 
                    onClick={() => handleStartMeditation(mantra)}
                    disabled={meditating !== null || (activeBuff !== null && activeBuff.name === mantra.name)}
                    isLoading={meditating === mantra.id}
                    className="min-w-[120px]"
                  >
                    {meditating === mantra.id ? 'Focusing...' : activeBuff?.name === mantra.name ? 'Active' : 'Meditate'}
                  </Button>
                  {activeBuff?.name === mantra.name && (
                    <span className="text-xs text-green-400 animate-pulse">Buff Active</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-xs text-slate-500 flex gap-4">
           <div>
             <span className="font-bold text-slate-400 block mb-1">Gameplay Tip:</span>
             Solving the Chi Puzzle requires patience. Hasty clicks will break your concentration.
           </div>
        </div>
      </div>
    </div>
  );
};