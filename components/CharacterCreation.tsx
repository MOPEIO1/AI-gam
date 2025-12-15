import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { PlayerStats, Attribute, Rarity } from '../types';
import { User, Book, Sword, Leaf, ArrowRight, Crown, RefreshCw, Star, Zap, Shield, Skull, Anchor, Hammer, Feather, Gem, Ghost, FlaskConical as Flask, Flame } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

interface Props {
  onComplete: (name: string, background: string, initialStats: Partial<PlayerStats>) => void;
  onCancel: () => void;
}

interface BackgroundOption {
    id: string;
    name: string;
    desc: string;
    stats: Partial<PlayerStats>;
    icon: React.ReactNode;
    rarity: Rarity;
    color: string;
    weight: number; 
}

const BACKGROUNDS: BackgroundOption[] = [
  // --- COMMON (6) - Weight 1000 ---
  { id: 'fool', name: 'Village Fool', desc: 'You know nothing, but you are tough.', stats: { [Attribute.Endurance]: 3, [Attribute.Luck]: 2 }, icon: <User className="w-12 h-12 text-slate-400"/>, rarity: 'Common', color: 'border-slate-600 bg-slate-900', weight: 1000 },
  { id: 'peasant', name: 'Peasant', desc: 'Used to hard labor in the fields.', stats: { [Attribute.Strength]: 2, [Attribute.Endurance]: 3 }, icon: <Hammer className="w-12 h-12 text-amber-600"/>, rarity: 'Common', color: 'border-slate-600 bg-amber-950/20', weight: 1000 },
  { id: 'beggar', name: 'Beggar', desc: 'Ignored by all, you see everything.', stats: { [Attribute.Perception]: 3, [Attribute.Luck]: 2 }, icon: <User className="w-12 h-12 text-gray-500"/>, rarity: 'Common', color: 'border-slate-600 bg-gray-900', weight: 1000 },
  { id: 'farmhand', name: 'Farmhand', desc: 'Strong back, simple mind.', stats: { [Attribute.Strength]: 4, [Attribute.Agility]: 1 }, icon: <Leaf className="w-12 h-12 text-green-600"/>, rarity: 'Common', color: 'border-slate-600 bg-green-950/20', weight: 1000 },
  { id: 'servant', name: 'Servant', desc: 'Obedient and unnoticed.', stats: { [Attribute.Agility]: 2, [Attribute.Endurance]: 2, [Attribute.Perception]: 1 }, icon: <User className="w-12 h-12 text-slate-500"/>, rarity: 'Common', color: 'border-slate-600 bg-slate-900', weight: 1000 },
  { id: 'militia', name: 'Militia Recruit', desc: 'Basic training with a spear.', stats: { [Attribute.Strength]: 2, [Attribute.Agility]: 2, [Attribute.Endurance]: 1 }, icon: <Sword className="w-12 h-12 text-slate-300"/>, rarity: 'Common', color: 'border-slate-600 bg-slate-900', weight: 1000 },

  // --- UNCOMMON (12) - Weight 200 ---
  { id: 'scholar', name: 'Scholar', desc: 'Book smarts over street smarts.', stats: { [Attribute.Intelligence]: 4, [Attribute.Chi]: 2 }, icon: <Book className="w-12 h-12 text-blue-400"/>, rarity: 'Uncommon', color: 'border-blue-500/30 bg-blue-950/30', weight: 200 },
  { id: 'hunter', name: 'Hunter', desc: 'At home in the wild.', stats: { [Attribute.Agility]: 3, [Attribute.Perception]: 3 }, icon: <Leaf className="w-12 h-12 text-green-400"/>, rarity: 'Uncommon', color: 'border-green-500/30 bg-green-950/30', weight: 200 },
  { id: 'merchant', name: 'Merchant', desc: 'An eye for value.', stats: { [Attribute.Intelligence]: 2, [Attribute.Luck]: 3, [Attribute.Perception]: 1 }, icon: <Gem className="w-12 h-12 text-yellow-600"/>, rarity: 'Uncommon', color: 'border-yellow-600/30 bg-yellow-950/20', weight: 200 },
  { id: 'soldier', name: 'Veteran Soldier', desc: 'Surived a few battles.', stats: { [Attribute.Strength]: 3, [Attribute.Endurance]: 3 }, icon: <Shield className="w-12 h-12 text-slate-200"/>, rarity: 'Uncommon', color: 'border-slate-400 bg-slate-800', weight: 200 },
  { id: 'acrobat', name: 'Acrobat', desc: 'Flexible and quick.', stats: { [Attribute.Agility]: 5, [Attribute.Luck]: 1 }, icon: <Feather className="w-12 h-12 text-cyan-400"/>, rarity: 'Uncommon', color: 'border-cyan-500/30 bg-cyan-950/30', weight: 200 },
  { id: 'scribe', name: 'Scribe', desc: 'Copied ancient texts.', stats: { [Attribute.Intelligence]: 3, [Attribute.Perception]: 3 }, icon: <Book className="w-12 h-12 text-blue-300"/>, rarity: 'Uncommon', color: 'border-blue-400/30 bg-blue-950/30', weight: 200 },
  { id: 'herbalist_bg', name: 'Herbalist', desc: 'Knows healing plants.', stats: { [Attribute.Perception]: 4, [Attribute.Intelligence]: 2 }, icon: <Leaf className="w-12 h-12 text-emerald-400"/>, rarity: 'Uncommon', color: 'border-emerald-500/30 bg-emerald-950/30', weight: 200 },
  { id: 'miner_bg', name: 'Miner', desc: 'Strong arms, bad lungs.', stats: { [Attribute.Strength]: 4, [Attribute.Endurance]: 2 }, icon: <Hammer className="w-12 h-12 text-gray-400"/>, rarity: 'Uncommon', color: 'border-gray-500/30 bg-gray-900', weight: 200 },
  { id: 'sailor', name: 'Sailor', desc: 'Traveled the seas.', stats: { [Attribute.Agility]: 2, [Attribute.Endurance]: 3, [Attribute.Luck]: 1 }, icon: <Anchor className="w-12 h-12 text-blue-500"/>, rarity: 'Uncommon', color: 'border-blue-600/30 bg-blue-950/30', weight: 200 },
  { id: 'guard', name: 'Caravan Guard', desc: 'Alert and sturdy.', stats: { [Attribute.Endurance]: 4, [Attribute.Perception]: 2 }, icon: <Shield className="w-12 h-12 text-orange-400"/>, rarity: 'Uncommon', color: 'border-orange-500/30 bg-orange-950/30', weight: 200 },
  { id: 'dancer', name: 'Dancer', desc: 'Graceful movement.', stats: { [Attribute.Agility]: 4, [Attribute.Chi]: 2 }, icon: <Star className="w-12 h-12 text-pink-400"/>, rarity: 'Uncommon', color: 'border-pink-500/30 bg-pink-950/30', weight: 200 },
  { id: 'apprentice_bg', name: 'Smith Apprentice', desc: 'Worked the forge.', stats: { [Attribute.Strength]: 3, [Attribute.Endurance]: 3 }, icon: <Hammer className="w-12 h-12 text-red-400"/>, rarity: 'Uncommon', color: 'border-red-500/30 bg-red-950/30', weight: 200 },

  // --- RARE (6) - Weight 50 ---
  { id: 'noble', name: 'Fallen Noble', desc: 'Born to luxury, stripped of titles.', stats: { [Attribute.Intelligence]: 4, [Attribute.Luck]: 4, [Attribute.Chi]: 2 }, icon: <Crown className="w-12 h-12 text-purple-400"/>, rarity: 'Rare', color: 'border-purple-500/50 bg-purple-950/30', weight: 50 },
  { id: 'sect_reject', name: 'Sect Reject', desc: 'Failed the entrance exam, but retained the basics.', stats: { [Attribute.Chi]: 5, [Attribute.Strength]: 3 }, icon: <Zap className="w-12 h-12 text-cyan-400"/>, rarity: 'Rare', color: 'border-cyan-500/50 bg-cyan-950/30', weight: 50 },
  { id: 'bounty', name: 'Bounty Hunter', desc: 'Relentless pursuit.', stats: { [Attribute.Strength]: 4, [Attribute.Agility]: 4, [Attribute.Perception]: 2 }, icon: <Skull className="w-12 h-12 text-red-500"/>, rarity: 'Rare', color: 'border-red-500/50 bg-red-950/30', weight: 50 },
  { id: 'prodigy', name: 'Martial Prodigy', desc: 'Natural talent seen once in a generation.', stats: { [Attribute.Strength]: 3, [Attribute.Agility]: 3, [Attribute.Chi]: 4 }, icon: <Star className="w-12 h-12 text-yellow-400"/>, rarity: 'Rare', color: 'border-yellow-500/50 bg-yellow-950/30', weight: 50 },
  { id: 'alchemist', name: 'Alchemist', desc: 'Experimented with spirit herbs.', stats: { [Attribute.Intelligence]: 6, [Attribute.Perception]: 3 }, icon: <Flask className="w-12 h-12 text-green-400"/>, rarity: 'Rare', color: 'border-green-500/50 bg-green-950/30', weight: 50 },
  { id: 'commander', name: 'Ex-Commander', desc: 'Led armies to victory.', stats: { [Attribute.Strength]: 4, [Attribute.Intelligence]: 4, [Attribute.Endurance]: 2 }, icon: <Sword className="w-12 h-12 text-orange-500"/>, rarity: 'Rare', color: 'border-orange-500/50 bg-orange-950/30', weight: 50 },

  // --- EPIC (3) - Weight 10 ---
  { id: 'reincarnated', name: 'Reincarnated Elder', desc: 'Memories of a past life linger.', stats: { [Attribute.Chi]: 8, [Attribute.Intelligence]: 8, [Attribute.Perception]: 5 }, icon: <Ghost className="w-12 h-12 text-indigo-400"/>, rarity: 'Epic', color: 'border-indigo-500 bg-indigo-950/50 shadow-indigo-500/20', weight: 10 },
  { id: 'spirit_beast', name: 'Spirit Beast Host', desc: 'A mythical creature resides within you.', stats: { [Attribute.Strength]: 7, [Attribute.Endurance]: 7, [Attribute.Chi]: 6 }, icon: <Zap className="w-12 h-12 text-fuchsia-400"/>, rarity: 'Epic', color: 'border-fuchsia-500 bg-fuchsia-950/50 shadow-fuchsia-500/20', weight: 10 },
  { id: 'demonic', name: 'Demonic Cultivator', desc: 'Power at any cost.', stats: { [Attribute.Strength]: 10, [Attribute.Chi]: 5, [Attribute.Luck]: -5 }, icon: <Skull className="w-12 h-12 text-red-600"/>, rarity: 'Epic', color: 'border-red-600 bg-red-950/50 shadow-red-600/20', weight: 10 },

  // --- LEGENDARY (2) - Weight 2 ---
  { id: 'dragon', name: 'Dragon Bloodline', desc: 'The blood of ancient dragons flows in your veins.', stats: { [Attribute.Strength]: 10, [Attribute.Endurance]: 10, [Attribute.Chi]: 10 }, icon: <Crown className="w-12 h-12 text-yellow-300"/>, rarity: 'Legendary', color: 'border-yellow-400 bg-yellow-900/60 shadow-[0_0_30px_rgba(250,204,21,0.5)]', weight: 2 },
  { id: 'phoenix', name: 'Phoenix Descendant', desc: 'Reborn from ashes, immortal flame.', stats: { [Attribute.Agility]: 10, [Attribute.Chi]: 12, [Attribute.Perception]: 8 }, icon: <Flame className="w-12 h-12 text-orange-400"/>, rarity: 'Legendary', color: 'border-orange-400 bg-orange-900/60 shadow-[0_0_30px_rgba(251,146,60,0.5)]', weight: 2 },

  // --- MYTHIC (1) - Weight 0.2 ---
  { id: 'heaven_son', name: 'Son of Heaven', desc: 'Destined to rule the cosmos.', stats: { [Attribute.Strength]: 15, [Attribute.Agility]: 15, [Attribute.Endurance]: 15, [Attribute.Chi]: 15, [Attribute.Luck]: 15 }, icon: <Star className="w-16 h-16 text-white animate-pulse"/>, rarity: 'Mythic', color: 'border-white bg-black shadow-[0_0_50px_rgba(255,255,255,0.8)]', weight: 0.2 },
];

export const CharacterCreation: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [currentBg, setCurrentBg] = useState<BackgroundOption | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rerollsLeft, setRerollsLeft] = useState(3);

  useEffect(() => {
    // Initial roll (doesn't count towards limit)
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    setCurrentBg(randomBg);
  }, []);

  const rollBackground = () => {
    if (isRolling || rerollsLeft <= 0) return;

    setRerollsLeft(prev => prev - 1);
    setIsRolling(true);
    SoundManager.playClick();

    let rolls = 0;
    const maxRolls = 15;
    
    const interval = setInterval(() => {
        const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
        setCurrentBg(randomBg);
        rolls++;
        
        if (rolls >= maxRolls) {
            clearInterval(interval);
            
            // Final weighted selection
            const totalWeight = BACKGROUNDS.reduce((acc, bg) => acc + bg.weight, 0);
            let random = Math.random() * totalWeight;
            let finalBg = BACKGROUNDS[0];
            
            for (const bg of BACKGROUNDS) {
                if (random < bg.weight) {
                    finalBg = bg;
                    break;
                }
                random -= bg.weight;
            }
            
            setCurrentBg(finalBg);
            setIsRolling(false);
            if (['Rare', 'Epic', 'Legendary', 'Mythic'].includes(finalBg.rarity)) SoundManager.playSuccess();
        }
    }, 80);
  };

  const handleFinish = () => {
    if (!name || !currentBg) return;
    onComplete(name, currentBg.name, currentBg.stats);
  };

  const getRarityBadgeColor = (rarity: Rarity) => {
      switch(rarity) {
          case 'Common': return 'text-slate-400 border-slate-600 bg-slate-900';
          case 'Uncommon': return 'text-green-400 border-green-600 bg-green-900/30';
          case 'Rare': return 'text-blue-400 border-blue-600 bg-blue-900/30';
          case 'Epic': return 'text-purple-400 border-purple-600 bg-purple-900/30';
          case 'Legendary': return 'text-yellow-400 border-yellow-600 bg-yellow-900/30';
          case 'Mythic': return 'text-white border-white bg-black shadow-[0_0_10px_white]';
          default: return 'text-slate-400';
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-700 via-cyan-900 to-slate-700" />
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-fantasy text-slate-100 mb-2">Wheel of Reincarnation</h2>
          <p className="text-slate-400">Your origin is decided by the heavens.</p>
        </div>

        <div className="space-y-8">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cultivator Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-lg text-white focus:border-cyan-500 focus:outline-none transition-colors pl-12"
                maxLength={20}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            </div>
          </div>

          {/* Background Card */}
          <div className="flex flex-col items-center">
             <div className="flex justify-between w-full mb-4 items-end">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Destiny</label>
                <div className="text-xs text-slate-500">Rerolls left: <span className={rerollsLeft > 0 ? 'text-cyan-400 font-bold' : 'text-red-500 font-bold'}>{rerollsLeft}</span></div>
             </div>
             
             {currentBg && (
                 <div className={`w-full p-8 rounded-xl border-2 transition-all relative overflow-hidden flex flex-col items-center text-center gap-4 ${currentBg.color} ${isRolling ? 'blur-sm scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
                    <div className="p-4 bg-slate-900/80 rounded-full border border-slate-700 shadow-xl relative z-10">
                      {currentBg.icon}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-slate-100 font-fantasy tracking-wide">{currentBg.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full border uppercase font-bold tracking-wider ${getRarityBadgeColor(currentBg.rarity)}`}>
                            {currentBg.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto italic">"{currentBg.desc}"</p>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        {Object.entries(currentBg.stats).map(([k, v]) => (
                            <div key={k} className="flex flex-col items-center bg-slate-900/80 px-3 py-2 rounded border border-slate-700 min-w-[80px]">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">{k}</span>
                                <span className="text-lg font-mono text-cyan-400">{(v as number) > 0 ? '+' : ''}{v}</span>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Background glow for rare items */}
                    {(currentBg.rarity === 'Legendary' || currentBg.rarity === 'Mythic') && (
                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent pointer-events-none animate-pulse" />
                    )}
                 </div>
             )}

             <div className="flex gap-4 mt-6 w-full">
                <Button 
                    onClick={rollBackground} 
                    disabled={isRolling || rerollsLeft <= 0}
                    className={`flex-1 py-4 border-slate-700 text-slate-300 ${rerollsLeft <= 0 ? 'bg-slate-900 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}
                >
                    <RefreshCw className={`w-5 h-5 mr-2 ${isRolling ? 'animate-spin' : ''}`} /> 
                    {rerollsLeft <= 0 ? 'Fate Sealed' : 'Reroll Destiny'}
                </Button>
             </div>
             
             <div className="mt-4 flex gap-2 text-[10px] text-slate-600 flex-wrap justify-center">
                <span>Chance:</span>
                <span className="text-slate-400">Common (High)</span> &bull;
                <span className="text-green-800">Uncommon</span> &bull;
                <span className="text-blue-900">Rare</span> &bull;
                <span className="text-purple-900">Epic</span> &bull;
                <span className="text-yellow-900">Legendary</span> &bull;
                <span className="text-white opacity-20">Mythic</span>
             </div>
          </div>
        </div>

        <div className="pt-6 mt-8 border-t border-slate-800 flex-shrink-0">
          <Button 
            onClick={handleFinish} 
            disabled={!name || !currentBg || isRolling} 
            className="w-full py-4 text-lg font-fantasy bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-none shadow-[0_0_20px_rgba(8,145,178,0.3)]"
          >
            Accept Fate & Begin <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};