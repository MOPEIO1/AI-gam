import { Attribute, PlayerStats, LaborMastery, CultivationStage } from '../types';
import { Flame, Wind, Mountain, Eye, Brain, Clover, Zap, User, Star, Crown, Shield, Dumbbell, Sparkles } from 'lucide-react';
import React from 'react';

export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  bonusDescription: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  color: string;
  icon: React.ComponentType<any>;
  condition: (stats: PlayerStats, mastery: LaborMastery, stage: CultivationStage) => boolean;
}

// Note: Values for bonuses (like yield multipliers) should be handled in the respective game logic components 
// (Exploration, etc) by checking the equipped title ID.

export const TITLES: TitleDefinition[] = [
  {
    id: 'mortal',
    name: 'Mortal',
    description: 'A fragile being of flesh and blood.',
    bonusDescription: 'No bonuses.',
    rarity: 'Common',
    color: 'text-slate-400',
    icon: User,
    condition: () => true // Always unlocked
  },
  {
    id: 'lumberjack',
    name: 'Lumberjack',
    description: 'One who has felled a thousand trees.',
    bonusDescription: '+10% Wood Yield',
    rarity: 'Uncommon',
    color: 'text-amber-500',
    icon: Flame,
    condition: (s, m) => m.woodcutting >= 10
  },
  {
    id: 'stonebreaker',
    name: 'Stonebreaker',
    description: 'Muscles forged in the mines.',
    bonusDescription: '+10% Stone Yield',
    rarity: 'Uncommon',
    color: 'text-slate-400',
    icon: Mountain,
    condition: (s, m) => m.mining >= 10
  },
  {
    id: 'herbalist',
    name: 'Herbalist',
    description: 'Knows the scent of every root.',
    bonusDescription: '+10% Herb Yield',
    rarity: 'Uncommon',
    color: 'text-green-500',
    icon: Clover,
    condition: (s, m) => m.gathering >= 10
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Begun the path of cultivation.',
    bonusDescription: '+5% All XP Gain',
    rarity: 'Uncommon',
    color: 'text-blue-400',
    icon: Brain,
    condition: (s) => s[Attribute.Intelligence] >= 10 && s[Attribute.Chi] >= 10
  },
  {
    id: 'berserker',
    name: 'Berserker',
    description: 'Rage fuels your power.',
    bonusDescription: 'Small chance for double yield',
    rarity: 'Rare',
    color: 'text-red-500',
    icon: Flame,
    condition: (s) => s[Attribute.Strength] >= 50
  },
  {
    id: 'swiftfoot',
    name: 'Swiftfoot',
    description: 'Faster than the wind.',
    bonusDescription: '10% Chance to save Stamina',
    rarity: 'Rare',
    color: 'text-yellow-400',
    icon: Wind,
    condition: (s) => s[Attribute.Agility] >= 50
  },
  {
    id: 'iron_wall',
    name: 'Iron Wall',
    description: 'Unmovable object.',
    bonusDescription: '+1 Stamina Regen',
    rarity: 'Rare',
    color: 'text-gray-400',
    icon: Shield,
    condition: (s) => s[Attribute.Endurance] >= 50
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Wisdom beyond years.',
    bonusDescription: '+20% Mastery XP',
    rarity: 'Epic',
    color: 'text-blue-500',
    icon: Star,
    condition: (s) => s[Attribute.Intelligence] >= 100
  },
  {
    id: 'fortune_child',
    name: 'Fortune Child',
    description: 'Blessed by the heavens.',
    bonusDescription: '+10% Luck & Crit Chance',
    rarity: 'Epic',
    color: 'text-emerald-400',
    icon: Crown,
    condition: (s) => s[Attribute.Luck] >= 100
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'A master of labor and life.',
    bonusDescription: '+50% All Yields',
    rarity: 'Legendary',
    color: 'text-yellow-400',
    icon: Crown,
    condition: (s, m) => m.woodcutting >= 50 && m.mining >= 50 && m.gathering >= 50
  },
  {
    id: 'ascendant',
    name: 'Ascendant',
    description: 'Transcended mortal limits.',
    bonusDescription: '+100% Training Efficiency',
    rarity: 'Mythic',
    color: 'text-purple-400',
    icon: Zap,
    condition: (s, m, stage) => stage === 'Transcendent Realm'
  }
];

export const getTitleDefinition = (id: string): TitleDefinition => {
  return TITLES.find(t => t.id === id) || TITLES[0];
};

export const checkNewTitles = (
  currentStats: PlayerStats, 
  mastery: LaborMastery, 
  stage: CultivationStage, 
  ownedTitles: string[]
): string[] => {
  const newUnlocks: string[] = [];
  
  TITLES.forEach(title => {
    if (!ownedTitles.includes(title.id)) {
      if (title.condition(currentStats, mastery, stage)) {
        newUnlocks.push(title.id);
      }
    }
  });
  
  return newUnlocks;
};

export const getArchetype = (stats: PlayerStats) => {
  let highestStat = Attribute.Chi;
  let highestVal = -1;

  for (const [key, val] of Object.entries(stats)) {
    if (val > highestVal) {
      highestVal = val;
      highestStat = key as Attribute;
    }
  }

  switch (highestStat) {
    case Attribute.Strength:
      return { title: 'War God', stat: Attribute.Strength, icon: Dumbbell, color: 'text-orange-500' };
    case Attribute.Agility:
      return { title: 'Wind Walker', stat: Attribute.Agility, icon: Zap, color: 'text-yellow-400' };
    case Attribute.Endurance:
      return { title: 'Iron Mountain', stat: Attribute.Endurance, icon: Shield, color: 'text-green-500' };
    case Attribute.Perception:
      return { title: 'Eye of Void', stat: Attribute.Perception, icon: Eye, color: 'text-purple-500' };
    case Attribute.Intelligence:
      return { title: 'Grand Sage', stat: Attribute.Intelligence, icon: Brain, color: 'text-blue-500' };
    case Attribute.Luck:
      return { title: 'Heaven\'s Favorite', stat: Attribute.Luck, icon: Clover, color: 'text-emerald-400' };
    case Attribute.Chi:
    default:
      return { title: 'Spirit Master', stat: Attribute.Chi, icon: Sparkles, color: 'text-cyan-500' };
  }
};