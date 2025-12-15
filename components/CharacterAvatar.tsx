
import React from 'react';
import { PlayerStats, Attribute, CultivationStage } from '../types';
import { RefreshCw } from 'lucide-react';
import { getArchetype } from '../utils/mechanics';

interface Props {
  stats: PlayerStats;
  isAwakened: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  seedOverride?: string;
  onCustomize?: () => void;
  customLook?: string;
}

export const calculateStage = (stats: PlayerStats): CultivationStage => {
  const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
  
  if (totalStats < 20) return CultivationStage.Mortal;
  if (totalStats < 50) return CultivationStage.BodyTempering;
  if (totalStats < 100) return CultivationStage.QiCondensation;
  if (totalStats < 200) return CultivationStage.Foundation;
  if (totalStats < 400) return CultivationStage.CoreFormation;
  if (totalStats < 800) return CultivationStage.NascentSoul;
  if (totalStats < 1500) return CultivationStage.SoulAscension;
  if (totalStats < 3000) return CultivationStage.ImmortalThreshold;
  if (totalStats < 6000) return CultivationStage.Immortal;
  return CultivationStage.Transcendent;
};

export const CharacterAvatar: React.FC<Props> = ({ stats, isAwakened, size = 'md', className = '', seedOverride, onCustomize, customLook = 'default' }) => {
  const stage = calculateStage(stats);
  const archetype = getArchetype(stats);
  const ArchetypeIcon = archetype.icon;

  // Visual Config based on Archetype for colors/borders
  const getConfig = () => {
    // Override colors for Alchemist mode
    if (customLook === 'alchemist') {
        return { 
            bg: 'bg-emerald-500', 
            border: 'border-emerald-500/50', 
            text: 'text-emerald-400', 
            shadow: 'shadow-emerald-500/30' 
        };
    }

    switch (archetype.stat) {
      case Attribute.Strength:
        return { bg: 'bg-orange-500', border: 'border-orange-500/50', text: 'text-orange-400', shadow: 'shadow-orange-500/30' };
      case Attribute.Agility:
        return { bg: 'bg-yellow-400', border: 'border-yellow-400/50', text: 'text-yellow-400', shadow: 'shadow-yellow-400/30' };
      case Attribute.Endurance:
        return { bg: 'bg-green-500', border: 'border-green-500/50', text: 'text-green-400', shadow: 'shadow-green-500/30' };
      case Attribute.Perception:
        return { bg: 'bg-purple-500', border: 'border-purple-500/50', text: 'text-purple-400', shadow: 'shadow-purple-500/30' };
      case Attribute.Intelligence:
        return { bg: 'bg-blue-500', border: 'border-blue-500/50', text: 'text-blue-400', shadow: 'shadow-blue-500/30' };
      case Attribute.Luck:
        return { bg: 'bg-emerald-400', border: 'border-emerald-400/50', text: 'text-emerald-400', shadow: 'shadow-emerald-400/30' };
      case Attribute.Chi:
      default:
        return { bg: 'bg-cyan-500', border: 'border-cyan-500/50', text: 'text-cyan-400', shadow: 'shadow-cyan-500/30' };
    }
  };

  const config = getConfig();
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-56 h-56'
  };

  // Determine Seed based on Custom Look
  let finalSeed = seedOverride || `Hunter_${archetype.title}_${stage}`;
  let extraParams = "";

  if (customLook === 'alchemist') {
      finalSeed = `Alchemist_${stage}`; 
      extraParams = "&glasses=variant02&hair=short12"; 
  } else if (customLook === 'warrior') {
      finalSeed = `Warlord_${stage}`;
      extraParams = "&mouth=serious&eyebrows=angry";
  } else if (customLook === 'shadow') {
      finalSeed = `Rogue_${stage}`;
      extraParams = "&skin=variant05";
  }

  // Lorelei API
  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${finalSeed}&backgroundColor=transparent&clip=true${extraParams}`;

  return (
    <div 
        className={`relative flex flex-col items-center ${className} ${onCustomize ? 'cursor-pointer group' : ''}`}
        onClick={onCustomize}
        title={onCustomize ? "Click to change style" : ""}
    >
      {/* Avatar Frame (Elegant Portrait Style) */}
      <div className={`
        relative p-1 bg-slate-900 border-2 ${isAwakened ? 'border-yellow-300 animate-[pulse_2s_infinite]' : config.border} 
        ${sizeClasses[size]} transition-all duration-500 overflow-hidden shadow-2xl
        rounded-2xl ${config.shadow}
      `}>
        
        {/* Backdrop Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0 opacity-80`} />
        
        {/* Class Icon Watermark */}
        <div className="absolute -bottom-4 -right-4 flex items-center justify-center opacity-20 pointer-events-none z-0">
           <ArchetypeIcon className={`w-32 h-32 ${config.text}`} />
        </div>

        {/* Awakened Aura */}
        {isAwakened && (
           <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 to-transparent animate-pulse z-0" />
        )}

        {/* The Avatar Image - Zoomed in for Portrait feel */}
        <div className="relative z-10 w-full h-full overflow-hidden rounded-xl">
          <img 
            src={avatarUrl} 
            alt="Character" 
            className={`w-full h-full object-cover scale-110 translate-y-2 transition-transform duration-700 ${isAwakened ? 'scale-[1.25]' : ''}`}
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} 
          />
        </div>

        {/* Hover Overlay for Changing Style */}
        {onCustomize && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 rounded-xl backdrop-blur-sm">
                <RefreshCw className="text-white w-8 h-8 mb-2" />
                <span className="text-[10px] text-white absolute bottom-4 font-mono uppercase tracking-widest">Customize</span>
            </div>
        )}
      </div>
      
      {/* Label (Bottom) */}
      {(size === 'lg' || size === 'xl') && customLook !== 'default' && (
         <div className="mt-2 text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">{customLook} Mode</div>
         </div>
      )}
    </div>
  );
};
