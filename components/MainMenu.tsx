import React from 'react';
import { SaveData } from '../types';
import { User, Plus, Trash2, Play, Crown, Sparkles, Scroll } from 'lucide-react';
import { Button } from './Button';

interface Props {
  saves: Record<string, SaveData | null>;
  onNewGame: (slotId: string) => void;
  onLoadGame: (slotId: string) => void;
  onDeleteGame: (slotId: string) => void;
}

export const MainMenu: React.FC<Props> = ({ saves, onNewGame, onLoadGame, onDeleteGame }) => {
  const slots = ['1', '2', '3'];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2568&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <div className="text-center mb-12 animate-in slide-in-from-top-10 duration-1000">
          <h1 className="text-5xl md:text-7xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] mb-4">
            Celestial Ascension
          </h1>
          <p className="text-slate-400 text-lg font-serif tracking-widest uppercase border-t border-b border-slate-800 py-2 inline-block">
            The Path of Chi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {slots.map((slotId, index) => {
            const save = saves[slotId];
            
            return (
              <div 
                key={slotId}
                className={`
                  relative h-96 rounded-2xl border transition-all duration-300 group
                  ${save 
                    ? 'bg-slate-900/60 border-cyan-900 hover:border-cyan-500/50 hover:bg-slate-900/80' 
                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-600 border-dashed'}
                `}
              >
                {save ? (
                  <div className="h-full p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                           <User className="text-cyan-400 w-8 h-8" />
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Slot {index + 1}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-100 mb-1 font-fantasy truncate">{save.name}</h3>
                      <p className="text-xs text-cyan-500 uppercase tracking-wider mb-4">{save.background} Origin</p>
                      
                      <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex justify-between border-b border-slate-800/50 pb-1">
                          <span>Power Level</span>
                          <span className="text-slate-200">{Object.values(save.stats).reduce((a: number, b: number) => a + b, 0)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/50 pb-1">
                          <span>Scrolls</span>
                          <span className="text-slate-200">{save.scrolls.length}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/50 pb-1">
                          <span>Wealth</span>
                          <span className="text-amber-400 flex items-center gap-1">{save.currency} <Sparkles size={10} /></span>
                        </div>
                        <div className="pt-2 text-xs text-slate-600">
                          Last played: {new Date(save.lastPlayedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      <Button onClick={() => onLoadGame(slotId)} className="w-full py-6 text-lg font-fantasy group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        Continue Journey <Play className="w-4 h-4" />
                      </Button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm("Are you sure you want to erase this destiny?")) onDeleteGame(slotId); }}
                        className="text-xs text-red-900 hover:text-red-500 flex items-center justify-center gap-1 py-2 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Erase Destiny
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer" onClick={() => onNewGame(slotId)}>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                      <Plus className="w-8 h-8 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-500 group-hover:text-slate-300 mb-2">Empty Vessel</h3>
                    <p className="text-sm text-slate-600 group-hover:text-slate-500">
                      Begin a new cycle of reincarnation in Slot {index + 1}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="absolute bottom-4 text-xs text-slate-600 font-mono">
        v0.5.1 // System Active
      </div>
    </div>
  );
};