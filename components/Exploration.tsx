
import React, { useState, useEffect, useRef } from 'react';
import { Map, Mountain, Trees, Waves, Skull, Gem, Pickaxe, Axe, Sprout, Lock, Play, ArrowUp, Zap, Clock, Shield, Hammer, Feather, Droplet, Moon, Sun, Award, RotateCw, X, BookOpen, Fish, Hand, Swords, Disc, User } from 'lucide-react';
import { Button } from './Button';
import { generateExplorationEncounter } from '../services/geminiService';
import { GameLogEntry, PlayerStats, Shard, Attribute, CultivationStage, Resources, LaborMastery, InventoryItem, ItemType, Scroll, Technique } from '../types';
import { StatBar } from './StatBar';
import { SoundManager } from '../utils/SoundManager';
import { getTitleDefinition } from '../utils/mechanics';
import { DungeonCrawler } from './DungeonCrawler';

interface Props {
  onAddLog: (log: GameLogEntry) => void;
  onFindShard: (shard: Shard) => void;
  onEarnCurrency: (amount: number) => void;
  onTrainStat: (stat: Attribute, amount: number) => void;
  stats: PlayerStats;
  tutorialActive?: boolean;
  onActionComplete?: (action: string) => void;
  currentStage?: CultivationStage;
  resources?: Resources;
  laborMastery?: LaborMastery;
  stamina?: number;
  setResources?: (r: Resources) => void;
  setLaborMastery?: (m: LaborMastery) => void;
  setStamina?: (s: number) => void;
  onAddItems?: (items: InventoryItem[]) => void;
  equippedTitle?: string;
  inventory?: InventoryItem[]; // Pass inventory to exploration if needed
  scrolls?: Scroll[];
  techniques?: Technique[];
  avatarSeed?: string; // Seed for avatar generation
  background?: string; // Player background for origin bonuses
}

interface FloatingEffect {
  id: number;
  x: number;
  y: number;
  content: React.ReactNode;
  color: string;
}

const STAGE_ORDER: CultivationStage[] = [
  CultivationStage.Mortal,
  CultivationStage.BodyTempering,
  CultivationStage.QiCondensation,
  CultivationStage.Foundation,
  CultivationStage.CoreFormation,
  CultivationStage.NascentSoul,
  CultivationStage.SoulAscension,
  CultivationStage.ImmortalThreshold,
  CultivationStage.Immortal,
  CultivationStage.Transcendent
];

const LABOR_JOBS = [
  { 
    id: 'chop', 
    name: 'Chop Bamboo', 
    realm: CultivationStage.Mortal, 
    stat: Attribute.Strength, 
    type: 'wood',
    yieldsResource: true,
    icon: <Axe className="w-5 h-5 text-amber-500" />,
    color: 'bg-amber-900/40 border-amber-500',
    yieldMod: 1,
    miniGame: null 
  },
  { 
    id: 'mine', 
    name: 'Mine Stone', 
    realm: CultivationStage.Mortal, 
    stat: Attribute.Endurance, 
    type: 'stone',
    yieldsResource: true,
    icon: <Pickaxe className="w-5 h-5 text-slate-400" />,
    color: 'bg-slate-700/60 border-slate-400',
    yieldMod: 1,
    miniGame: null
  },
  { 
    id: 'gather', 
    name: 'Pick Herbs', 
    realm: CultivationStage.Mortal, 
    stat: Attribute.Perception, 
    type: 'herb',
    yieldsResource: true,
    icon: <Sprout className="w-5 h-5 text-green-500" />,
    color: 'bg-green-900/40 border-green-500',
    yieldMod: 1,
    miniGame: null
  },
  {
    id: 'fish',
    name: 'Catch Fish',
    realm: CultivationStage.Mortal, 
    stat: Attribute.Agility,
    type: 'none', 
    yieldsResource: false, // Fishing gives Items, not generic "Wood/Stone"
    icon: <Fish className="w-5 h-5 text-blue-400" />,
    color: 'bg-blue-900/40 border-blue-500',
    yieldMod: 1.0,
    miniGame: 'fishing'
  },
  {
    id: 'study',
    name: 'Read Classics',
    realm: CultivationStage.Mortal, 
    stat: Attribute.Intelligence,
    type: 'none',
    yieldsResource: false,
    icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
    color: 'bg-indigo-900/40 border-indigo-500',
    yieldMod: 0, // No material yield, high XP
    miniGame: 'reading'
  },
  {
    id: 'wheel',
    name: 'Fortune Wheel',
    realm: CultivationStage.Mortal,
    stat: Attribute.Luck,
    type: 'none', 
    yieldsResource: false,
    icon: <Disc className="w-5 h-5 text-yellow-200 animate-spin-slow" />,
    color: 'bg-yellow-900/20 border-yellow-200/50',
    yieldMod: 0,
    miniGame: 'wheel' 
  },
  {
    id: 'breath',
    name: 'Basic Breathing',
    realm: CultivationStage.Mortal,
    stat: Attribute.Chi,
    type: 'none',
    yieldsResource: false,
    icon: <Zap className="w-5 h-5 text-cyan-200" />,
    color: 'bg-cyan-900/20 border-cyan-400/50',
    yieldMod: 0,
    miniGame: 'breathing'
  },
  { 
    id: 'carry', 
    name: 'Carry Heavy Loads', 
    realm: CultivationStage.BodyTempering, 
    stat: Attribute.Endurance, 
    type: 'stone', 
    yieldsResource: true,
    icon: <Hammer className="w-5 h-5 text-orange-500" />,
    color: 'bg-orange-900/40 border-orange-500',
    yieldMod: 2,
    miniGame: null
  },
  { 
    id: 'drill', 
    name: 'Iron Body Drills', 
    realm: CultivationStage.BodyTempering, 
    stat: Attribute.Strength, 
    type: 'wood', 
    yieldsResource: true,
    icon: <Shield className="w-5 h-5 text-red-500" />,
    color: 'bg-red-900/40 border-red-500',
    yieldMod: 2,
    miniGame: null 
  },
  { 
    id: 'spirit_dew', 
    name: 'Collect Spirit Dew', 
    realm: CultivationStage.QiCondensation, 
    stat: Attribute.Chi, 
    type: 'herb', 
    yieldsResource: true,
    icon: <Droplet className="w-5 h-5 text-cyan-400" />,
    color: 'bg-cyan-900/40 border-cyan-500',
    yieldMod: 4,
    miniGame: null
  },
   { 
    id: 'night_meditate', 
    name: 'Moonlight Meditation', 
    realm: CultivationStage.QiCondensation, 
    stat: Attribute.Perception, 
    type: 'wood', 
    yieldsResource: true,
    icon: <Moon className="w-5 h-5 text-purple-400" />,
    color: 'bg-purple-900/40 border-purple-500',
    yieldMod: 4,
    miniGame: null
  }
];

// Adjusted to align roughly with realm stat requirements (Realm Req * 7 stats)
const BIOMES = [
  { name: 'Spirit Bamboo Forest', icon: <Trees className="text-green-400" />, difficulty: 1, minStage: CultivationStage.BodyTempering, minPower: 350 },
  { name: 'Azure Lake Ruins', icon: <Waves className="text-blue-400" />, difficulty: 2, minStage: CultivationStage.QiCondensation, minPower: 1000 },
  { name: 'Volcanic Peak', icon: <Mountain className="text-red-400" />, difficulty: 3, minStage: CultivationStage.CoreFormation, minPower: 4200 },
  { name: 'Void Badlands', icon: <Skull className="text-purple-400" />, difficulty: 5, minStage: CultivationStage.NascentSoul, minPower: 8400 },
];

const FISH_LOOT = [
    { name: 'Spirit Minnow', value: 5, rarity: 'Common' },
    { name: 'Blue Carp', value: 15, rarity: 'Uncommon' },
    { name: 'Golden Koi', value: 50, rarity: 'Rare' },
    { name: 'Dragon Fish', value: 200, rarity: 'Legendary' }
];

const WOOD_TYPES = ["Rotten Branch", "Bamboo Stalk", "Spirit Pine", "Ironwood Log", "Elder Oak", "Dragon Root"];
const STONE_TYPES = ["Common Pebble", "Rock Ore", "Iron Ore", "Spirit Jade", "Star Metal", "Void Crystal"];
const HERB_TYPES = ["Weed", "Wild Ginseng", "Spirit Mushroom", "Blood Lotus", "Golden Root", "Immortal Flower"];

export const Exploration: React.FC<Props> = ({ 
  onAddLog, 
  onFindShard, 
  onEarnCurrency, 
  onTrainStat, 
  stats,
  tutorialActive = false,
  onActionComplete,
  currentStage = CultivationStage.Mortal,
  resources = { wood: 0, stone: 0, herbs: 0 },
  laborMastery = { woodcutting: 1, mining: 1, gathering: 1, woodcuttingXp: 0, miningXp: 0, gatheringXp: 0 },
  stamina = 100,
  setResources,
  setLaborMastery,
  setStamina,
  onAddItems,
  equippedTitle = 'mortal',
  scrolls = [],
  techniques = [],
  avatarSeed = 'Player',
  background = 'Village Fool'
}) => {
  const [exploringBiome, setExploringBiome] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string>('chop');
  const [effects, setEffects] = useState<FloatingEffect[]>([]);
  const [clickScale, setClickScale] = useState(1);
  const [activeMiniGame, setActiveMiniGame] = useState<'fishing' | 'breathing' | 'reading' | 'wheel' | null>(null);
  
  // Dungeon State
  const [inDungeon, setInDungeon] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<any>(null);
  const [loadout, setLoadout] = useState<Scroll[]>([]);
  const [showLoadout, setShowLoadout] = useState(false);

  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Breathing Game State
  const [breathScale, setBreathScale] = useState(1);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Fishing Game State
  const fishPosRef = useRef(50);
  const fishDirectionRef = useRef(1); // 1 = right, -1 = left
  const fishSpeedRef = useRef(0.5);
  const [renderFishPos, setRenderFishPos] = useState(50);
  const animationFrameRef = useRef<number | null>(null);
  const [hookPos, setHookPos] = useState(50);

  // Reading Game State
  const [readingSequence, setReadingSequence] = useState<number[]>([]);
  const [readingStep, setReadingStep] = useState(0);
  const [readingShow, setReadingShow] = useState(false);

  const maxStamina = 100 + (stats[Attribute.Endurance] * 5);
  const activeJob = LABOR_JOBS.find(j => j.id === activeJobId) || LABOR_JOBS[0];
  const totalPower = (Object.values(stats) as number[]).reduce((a: number, b: number) => a + b, 0);
  
  const titleDef = getTitleDefinition(equippedTitle);
  const isGrandmaster = equippedTitle === 'grandmaster';

  const isJobUnlocked = (requiredStage: CultivationStage) => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const requiredIndex = STAGE_ORDER.indexOf(requiredStage);
    return currentIndex >= requiredIndex;
  };

  const isBiomeUnlocked = (biome: any) => {
      const minPower = typeof biome.minPower === 'number' ? biome.minPower : 0;
      if (totalPower < minPower) return false;
      const currentIndex = STAGE_ORDER.indexOf(currentStage || CultivationStage.Mortal);
      const requiredIndex = STAGE_ORDER.indexOf(biome.minStage);
      return currentIndex >= requiredIndex;
  };

  const showWorldMap = totalPower >= 50;

  useEffect(() => {
    if (effects.length > 0) {
      const timer = setTimeout(() => {
        setEffects(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [effects]);

  const addEffect = (e: React.MouseEvent | null, content: React.ReactNode, color: string) => {
    const x = e ? e.nativeEvent.offsetX : 50;
    const y = e ? e.nativeEvent.offsetY : 20;

    setEffects(prev => [...prev, {
      id: Date.now() + Math.random(),
      x,
      y,
      content,
      color
    }]);
  };

  const getResourceFlavorName = (type: string, masteryLevel: number) => {
    const tier = Math.min(Math.floor(masteryLevel / 10), 5); 
    const list = type === 'wood' ? WOOD_TYPES : type === 'stone' ? STONE_TYPES : HERB_TYPES;
    // Add some randomness so higher level players still find common stuff sometimes
    const variance = Math.random();
    let index = 0;
    if (variance > 0.6) index = tier; // 40% chance for highest tier available
    else if (variance > 0.3 && tier > 0) index = tier - 1;
    else index = Math.max(0, Math.floor(Math.random() * (tier + 1)));
    
    return list[index];
  };

  // --- FISHING GAME LOOP ---
  useEffect(() => {
    if (activeMiniGame !== 'fishing') {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        return;
    }
    
    const animateFish = () => {
        let newPos = fishPosRef.current + (fishSpeedRef.current * fishDirectionRef.current);
        
        if (Math.random() < 0.02) fishDirectionRef.current *= -1;
        if (Math.random() < 0.05) fishSpeedRef.current = Math.random() * 1.5 + 0.5;

        if (newPos > 90) { newPos = 90; fishDirectionRef.current = -1; } 
        else if (newPos < 10) { newPos = 10; fishDirectionRef.current = 1; }

        fishPosRef.current = newPos;
        setRenderFishPos(newPos);
        animationFrameRef.current = requestAnimationFrame(animateFish);
    };

    animationFrameRef.current = requestAnimationFrame(animateFish);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); }
  }, [activeMiniGame]);

  const handleFishingClick = (e: React.MouseEvent) => {
      const distance = Math.abs(fishPosRef.current - 50);
      const success = distance < 10; 

      if (success) {
          SoundManager.playSuccess();
          handleLaborSuccess(e, 1.5); // Bonus
          
          // Fishing Drops Logic
          const roll = Math.random();
          let caughtFish = FISH_LOOT[0];
          if (roll > 0.95) caughtFish = FISH_LOOT[3];
          else if (roll > 0.8) caughtFish = FISH_LOOT[2];
          else if (roll > 0.6) caughtFish = FISH_LOOT[1];

          if (onAddItems) {
              onAddItems([{
                  id: Date.now().toString(),
                  name: caughtFish.name,
                  description: "A fresh catch from the spirit lake.",
                  quantity: 1,
                  value: caughtFish.value,
                  type: ItemType.Resource,
                  rarity: caughtFish.rarity as any
              }]);
              addEffect(e, caughtFish.name, "text-blue-300 font-bold");
          }

          setTimeout(() => setActiveMiniGame(null), 250);
      } else {
          SoundManager.playClick();
          setHookPos(prev => prev === 50 ? (fishPosRef.current < 50 ? 80 : 20) : 50);
          setTimeout(() => setHookPos(50), 200);
      }
  };

  // --- BREATHING GAME LOOP ---
  useEffect(() => {
      if (activeMiniGame !== 'breathing') return;
      const cycle = 4000;
      const interval = setInterval(() => {
          const now = Date.now();
          const t = (now % cycle) / cycle;
          if (t < 0.4) { setBreathPhase('inhale'); setBreathScale(1 + t); } 
          else if (t < 0.6) { setBreathPhase('hold'); setBreathScale(1.4); } 
          else { setBreathPhase('exhale'); setBreathScale(1.4 - (t - 0.6)); }
      }, 50);
      return () => clearInterval(interval);
  }, [activeMiniGame]);

  const handleBreathingInteraction = (e: React.MouseEvent) => {
      if (breathPhase === 'hold') {
          SoundManager.playSuccess();
          handleLaborSuccess(e, 3.0); // High XP Bonus for breathing
          addEffect(e, "+Chi", "text-cyan-400 font-bold");
          setTimeout(() => setActiveMiniGame(null), 500);
      } else {
          addEffect(e, "Unbalanced...", "text-slate-500");
      }
  };

  // --- READING GAME LOGIC ---
  const startReadingGame = () => {
      const seq = [0, 1, 2].sort(() => Math.random() - 0.5);
      setReadingSequence(seq);
      setReadingStep(0);
      setReadingShow(true);
      setTimeout(() => setReadingShow(false), 1000);
  };

  const handleReadingClick = (idx: number, e: React.MouseEvent) => {
      if (readingShow) return; 
      if (idx === readingSequence[readingStep]) {
          if (readingStep === 2) {
              SoundManager.playSuccess();
              handleLaborSuccess(e, 3.0); // High XP Bonus for reading
              addEffect(e, "Wisdom Gained", "text-indigo-400 font-bold");
              setTimeout(() => setActiveMiniGame(null), 500);
          } else {
              setReadingStep(s => s + 1);
              SoundManager.playClick();
          }
      } else {
          addEffect(e, "Focus Lost...", "text-red-400");
          setTimeout(() => setActiveMiniGame(null), 500);
      }
  };

  // --- WHEEL GAME (LUCK/ENERGY) ---
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    SoundManager.playClick();

    const winningSpots = [0, 2, 5, 7];
    const outcome = Math.floor(Math.random() * 10); 
    const segmentAngle = 36;
    const targetOffset = 360 - (outcome * segmentAngle);
    const extraSpins = 5 * 360;
    const totalRotationDelta = extraSpins + targetOffset;
    
    const duration = 3000;
    const startTime = performance.now();
    const startRotation = wheelRotation;
    
    // For calculating tick sounds
    let lastSegmentIndex = Math.floor(startRotation / 36);
    
    const trackRotation = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        if (elapsed >= duration) {
            setWheelRotation(startRotation + totalRotationDelta);
            return;
        }
        const t = elapsed / duration;
        const ease = 1 - Math.pow(1 - t, 3);
        const currentRot = startRotation + (totalRotationDelta * ease);
        setWheelRotation(currentRot);

        // Sound Logic: Play tick whenever we cross a 36-degree boundary
        const currentSegmentIndex = Math.floor(currentRot / 36);
        if (currentSegmentIndex > lastSegmentIndex) {
            SoundManager.playWheelTick();
            lastSegmentIndex = currentSegmentIndex;
        }
        requestAnimationFrame(trackRotation);
    };
    requestAnimationFrame(trackRotation);

    setTimeout(() => {
        setIsSpinning(false);
        if (winningSpots.includes(outcome)) {
            SoundManager.playJackpot(); // New Distinct Win Sound
            // Win: Restore Energy & Gain Luck
            if (setStamina) setStamina(Math.min(maxStamina, stamina + 50));
            onTrainStat(Attribute.Luck, 1);
            addEffect(null, "Fortune Favors You!", "text-yellow-400 font-bold");
            addEffect(null, "+50 Energy", "text-cyan-400 text-sm");
            setTimeout(() => setActiveMiniGame(null), 1500);
        } else {
            // Lose: Small Pity Energy
            if (setStamina) setStamina(Math.min(maxStamina, stamina + 5));
            addEffect(null, "A Small Respite...", "text-slate-500");
            addEffect(null, "+5 Energy", "text-slate-400 text-xs");
            setTimeout(() => setActiveMiniGame(null), 1000);
        }
    }, duration);
  };

  // --- CORE LABOR LOGIC ---
  const handleJobClick = () => {
      // Validate Unlock Again
      if (!isJobUnlocked(activeJob.realm)) {
          return;
      }

      // Praying/Wheel doesn't cost stamina, it restores it
      if (activeJob.id !== 'wheel' && stamina < 1) {
          addEffect(null, "Exhausted!", "text-red-500");
          return;
      }
      
      SoundManager.playClick();
      
      if (activeJob.miniGame) {
          setActiveMiniGame(activeJob.miniGame as any);
          if (activeJob.miniGame === 'reading') startReadingGame();
      } else {
          handleLaborSuccess(null, 1.0);
      }
  };

  const handleLaborSuccess = (e: React.MouseEvent | null, performanceMod: number) => {
    // Stamina Cost (Skip for Prayer/Wheel as it restores energy)
    if (activeJob.id !== 'wheel') {
        let staminaCost = 1;
        if (setStamina) setStamina(Math.max(0, stamina - staminaCost));
    }

    setClickScale(0.95);
    setTimeout(() => setClickScale(1), 100);

    const getMasteryLevel = () => {
      if (activeJob.type === 'wood') return laborMastery.woodcutting;
      if (activeJob.type === 'stone') return laborMastery.mining;
      return laborMastery.gathering;
    };
    
    const currentMasteryLevel = getMasteryLevel();
    const masteryBonus = 1 + (Math.floor(currentMasteryLevel / 5) * 0.5); 

    // Sound
    if (!activeJob.miniGame) {
        if (activeJob.type === 'wood') SoundManager.playChop();
        else if (activeJob.type === 'stone') SoundManager.playMine();
        else SoundManager.playGather();
    }

    // --- YIELD LOGIC ---
    if (activeJob.yieldsResource && setResources) {
        const statYield = stats[activeJob.stat] * 0.005;
        let yieldAmount = (0.01 + statYield) * activeJob.yieldMod * masteryBonus * performanceMod; 
        
        // Title Bonuses
        if (equippedTitle === 'lumberjack' && activeJob.type === 'wood') yieldAmount *= 1.1;
        if (equippedTitle === 'stonebreaker' && activeJob.type === 'stone') yieldAmount *= 1.1;
        if (equippedTitle === 'herbalist' && activeJob.type === 'herb') yieldAmount *= 1.1;
        if (isGrandmaster) yieldAmount *= 1.5;

        // Background Origin Bonuses
        if (background?.includes('Peasant') && activeJob.type === 'wood') yieldAmount *= 1.2;
        if (background?.includes('Farmhand') && activeJob.type === 'wood') yieldAmount *= 1.2;
        if (background?.includes('Miner') && activeJob.type === 'stone') yieldAmount *= 1.3;
        if (background?.includes('Herbalist') && activeJob.type === 'herb') yieldAmount *= 1.3;
        if (background?.includes('Fool')) yieldAmount *= 1.1; // Dumb luck?

        // Crit check
        let critChance = (stats[Attribute.Luck] / 100);
        if (background?.includes('Fortune') || background?.includes('Noble')) critChance += 0.05;

        const isCrit = Math.random() < critChance;
        if (isCrit) {
            yieldAmount *= 2;
            addEffect(e, "CRIT!", "text-yellow-400 font-bold");
        }

        const newRes = { ...resources };
        let flavorName = "";
        
        if (activeJob.type === 'wood') { 
            newRes.wood += yieldAmount; 
            flavorName = getResourceFlavorName('wood', laborMastery.woodcutting);
        }
        if (activeJob.type === 'stone') { 
            newRes.stone += yieldAmount; 
            flavorName = getResourceFlavorName('stone', laborMastery.mining);
        }
        if (activeJob.type === 'herb') { 
            newRes.herbs += yieldAmount; 
            flavorName = getResourceFlavorName('herb', laborMastery.gathering);
        }
        
        setResources(newRes);
        addEffect(e, `+${yieldAmount.toFixed(1)} ${flavorName}`, "text-slate-200");
    }

    // --- XP / STAT LOGIC ---
    let xpGain = 10 * performanceMod; 
    if (activeJob.type === 'none') xpGain *= 2; // Non-gathering jobs give more XP/Stats
    if (background?.includes('Sage') || background?.includes('Scholar')) xpGain *= 1.2; // Learning bonus

    // Stat Training Chance
    if (Math.random() < 0.2 * performanceMod) { 
      onTrainStat(activeJob.stat, 1);
      setTimeout(() => addEffect(null, `+1 ${activeJob.stat}`, "text-cyan-400"), 200);
    }

    // Update Mastery & Level Up Logic
    if (activeJob.yieldsResource && setLaborMastery) {
      const newMastery = { ...laborMastery };
      let type: 'woodcutting' | 'mining' | 'gathering' | null = null;
      
      if (activeJob.type === 'wood') { newMastery.woodcuttingXp += xpGain; type = 'woodcutting'; }
      else if (activeJob.type === 'stone') { newMastery.miningXp += xpGain; type = 'mining'; }
      else { newMastery.gatheringXp += xpGain; type = 'gathering'; }

      if (type) {
          const xpKey = `${type}Xp` as keyof LaborMastery;
          // Calculate if level up (Level * 100 XP required)
          const currentLevel = newMastery[type];
          const reqXp = currentLevel * 100;
          
          if (newMastery[xpKey] >= reqXp) {
              newMastery[type] += 1;
              newMastery[xpKey] -= reqXp; // Rollover XP
              addEffect(null, `${type.toUpperCase()} LEVEL ${newMastery[type]}!`, "text-yellow-400 font-bold text-lg");
              SoundManager.playSuccess();
          }
      }
      setLaborMastery(newMastery);
    }
    
    if (tutorialActive && onActionComplete) {
      onActionComplete('labor_done');
    }
  };

  // --- DUNGEON LOGIC ---

  const handlePreDungeon = (biome: any) => {
      setSelectedBiome(biome);
      setShowLoadout(true);
  };

  const toggleScrollLoadout = (scroll: Scroll) => {
      if (loadout.some(s => s.id === scroll.id)) {
          setLoadout(loadout.filter(s => s.id !== scroll.id));
      } else {
          if (loadout.length < 4) {
              setLoadout([...loadout, scroll]);
          }
      }
  };

  const startDungeon = () => {
      setShowLoadout(false);
      setInDungeon(true);
      SoundManager.playFusionCharge();
  };

  const handleDungeonExit = (loot: InventoryItem[], xp: number) => {
      setInDungeon(false);
      // Process loot
      if (onAddItems && loot.length > 0) onAddItems(loot);
      // Process XP (as Coin reward for now or stats?)
      if (onEarnCurrency) onEarnCurrency(Math.floor(xp / 10)); // Coins from XP
      
      onAddLog({
          id: Date.now().toString(),
          timestamp: new Date(),
          message: `Dungeon Cleared! Gained ${loot.length} items and ${xp} combat experience.`,
          type: 'success'
      });
  };

  const handleDungeonDeath = () => {
      setInDungeon(false);
      if (setStamina) setStamina(1); // Set to 1 stamina as penalty
      onAddLog({
          id: Date.now().toString(),
          timestamp: new Date(),
          message: `You were defeated in the ${selectedBiome.name}. Stamina drained.`,
          type: 'danger'
      });
  };

  const getActiveMastery = () => {
    if (activeJob.type === 'wood') return { lvl: laborMastery.woodcutting, xp: laborMastery.woodcuttingXp };
    if (activeJob.type === 'stone') return { lvl: laborMastery.mining, xp: laborMastery.miningXp };
    if (activeJob.type === 'herb') return { lvl: laborMastery.gathering, xp: laborMastery.gatheringXp };
    return { lvl: 0, xp: 0 }; // No mastery for specialized jobs
  };

  const masteryData = getActiveMastery();

  // --- RENDER DUNGEON MODE ---
  if (inDungeon && selectedBiome) {
      const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=transparent`;
      return (
          <DungeonCrawler 
            stats={stats}
            biome={selectedBiome.name}
            difficulty={selectedBiome.difficulty}
            equippedScrolls={loadout}
            passiveTechniques={techniques}
            onExit={handleDungeonExit}
            onDeath={handleDungeonDeath}
            avatarUrl={avatarUrl}
          />
      )
  }

  // --- RENDER LOADOUT SCREEN ---
  if (showLoadout && selectedBiome) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
              <h2 className="text-3xl font-fantasy text-red-500 mb-2">{selectedBiome.name}</h2>
              <p className="text-slate-400 mb-8">Prepare your spirit for combat. Select up to 4 Scrolls.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-96 overflow-y-auto w-full p-4 border border-slate-700 rounded-xl bg-slate-900/50">
                  {scrolls.length === 0 ? <p className="text-slate-500 col-span-full text-center">You have no combat scrolls.</p> : 
                   scrolls.map(scroll => (
                      <div 
                        key={scroll.id} 
                        onClick={() => toggleScrollLoadout(scroll)}
                        className={`p-3 rounded border cursor-pointer flex items-center justify-between transition-all
                            ${loadout.some(s => s.id === scroll.id) ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                      >
                          <div className="flex items-center gap-2">
                              <Zap size={16} className={scroll.type === 'Offensive' ? 'text-red-400' : 'text-blue-400'} />
                              <div className="text-sm font-bold text-slate-200">{scroll.name}</div>
                          </div>
                          {loadout.some(s => s.id === scroll.id) && <div className="w-2 h-2 bg-cyan-400 rounded-full" />}
                      </div>
                   ))
                  }
              </div>

              <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => setShowLoadout(false)}>Retreat</Button>
                  <Button variant="danger" onClick={startDungeon} disabled={loadout.length === 0 && scrolls.length > 0}>
                      <Swords className="mr-2" /> Enter Dungeon
                  </Button>
              </div>
          </div>
      )
  }

  // --- RENDER STANDARD EXPLORATION ---
  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Mini-Game Modal Overlay (Fishing etc) */}
      {activeMiniGame && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-in fade-in">
            {/* Background Images based on context */}
            {activeMiniGame === 'fishing' && <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30" />}
            {activeMiniGame === 'breathing' && <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1999&auto=format&fit=crop')] bg-cover bg-center opacity-30" />}
            {activeMiniGame === 'reading' && <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30" />}
            
            <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl">
                <button onClick={() => setActiveMiniGame(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X /></button>
                
                {/* Fishing UI */}
                {activeMiniGame === 'fishing' && (
                    <div className="text-center">
                        <h3 className="text-2xl font-fantasy text-blue-300 mb-4">Focus... Catch!</h3>
                        <div className="h-12 w-full bg-slate-800 rounded-full border border-blue-900 relative overflow-hidden cursor-pointer" onClick={handleFishingClick}>
                            <div className="absolute top-1 bottom-1 w-8 bg-blue-400 rounded-full transition-all duration-0 ease-linear shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ left: `${renderFishPos}%` }} />
                            <div className="absolute top-0 bottom-0 w-1 bg-red-500 z-10" style={{ left: '50%' }} />
                            <div className={`absolute top-0 bottom-0 w-12 border-2 ${hookPos !== 50 ? 'border-red-500' : 'border-yellow-400/50'} rounded-lg pointer-events-none transition-all duration-75`} style={{ left: `${hookPos}%`, transform: 'translateX(-50%)' }} />
                        </div>
                        <p className="mt-4 text-sm text-slate-400">Click when the <span className="text-blue-400 font-bold">Fish</span> aligns with the center!</p>
                    </div>
                )}

                {/* Breathing UI */}
                {activeMiniGame === 'breathing' && (
                    <div className="text-center flex flex-col items-center">
                        <h3 className="text-2xl font-fantasy text-cyan-300 mb-4">Harmonize Chi</h3>
                        <div 
                            className={`w-32 h-32 rounded-full border-4 border-cyan-500/30 flex items-center justify-center transition-all duration-[50ms] cursor-pointer
                                ${breathPhase === 'hold' ? 'bg-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'bg-transparent'}`}
                            style={{ transform: `scale(${breathScale})` }}
                            onMouseDown={handleBreathingInteraction}
                        >
                            <div className="text-xs font-mono uppercase text-cyan-200">{breathPhase}</div>
                        </div>
                        <p className="mt-6 text-sm text-slate-400">Click exactly when the circle is <span className="text-cyan-400 font-bold">Largest</span> (Hold).</p>
                    </div>
                )}

                {/* Reading UI */}
                {activeMiniGame === 'reading' && (
                    <div className="text-center">
                        <h3 className="text-2xl font-fantasy text-indigo-300 mb-4">Decipher Texts</h3>
                        <div className="flex justify-center gap-4 mb-6 min-h-[60px]">
                            {readingShow ? (
                                readingSequence.map((val, i) => (
                                    <div key={i} className="w-12 h-12 bg-indigo-900 border border-indigo-500 flex items-center justify-center font-bold text-xl animate-bounce">
                                        {val + 1}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 italic">Recite the sequence...</div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4">
                            {[0, 1, 2].map((val) => (
                                <button 
                                    key={val}
                                    onClick={(e) => handleReadingClick(val, e)}
                                    className="w-16 h-16 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-indigo-400 transition-colors text-2xl font-fantasy"
                                >
                                    {val + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Wheel UI (Luck/Energy) */}
                {activeMiniGame === 'wheel' && (
                    <div className="text-center flex flex-col items-center">
                        <h3 className="text-2xl font-fantasy text-yellow-300 mb-4">Heavens' Blessing</h3>
                        <div className="relative mb-6">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-white drop-shadow-md">
                                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-red-500" />
                            </div>
                            <div 
                                className="w-48 h-48 rounded-full border-4 border-amber-500/30 bg-slate-800 relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                                style={{ transform: `rotate(${wheelRotation}deg)` }}
                            >
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className={`absolute top-0 left-1/2 w-0 h-1/2 origin-bottom pt-4 flex justify-center -ml-[1px] border-l border-slate-700/50`} style={{ transform: `rotate(${i * 36}deg)` }}>
                                        <div className="-mt-1 -ml-4">
                                            {[0, 2, 5, 7].includes(i) ? <Zap className="text-yellow-400 fill-yellow-400" size={16} /> : <X className="text-slate-600 opacity-50" size={10} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button onClick={handleSpinWheel} disabled={isSpinning}>
                            {isSpinning ? 'Divining...' : 'Spin for Stamina'}
                        </Button>
                        <p className="mt-2 text-xs text-slate-500">Win: Restore Energy + Gain Luck</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Main Job Selection UI */}
      <div className={`bg-slate-900/80 p-6 rounded-xl border relative overflow-hidden transition-all duration-500 ${tutorialActive ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-700'}`}>
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-fantasy text-amber-200 flex items-center gap-2">
              <Pickaxe className="w-6 h-6" /> Manual Labor
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <Zap size={14} className={stamina < 20 ? "text-red-500 animate-pulse" : "text-yellow-400"} />
                    <span className={stamina < 20 ? "text-red-400 font-bold" : "text-slate-300"}>{stamina}</span> / {maxStamina}
                </div>
              </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {LABOR_JOBS.map(job => {
                const unlocked = isJobUnlocked(job.realm);
                return (
                  <div 
                    key={job.id} 
                    onClick={() => { 
                      if (unlocked) {
                        SoundManager.playClick(); 
                        setActiveJobId(job.id); 
                      }
                    }} 
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between relative overflow-hidden
                      ${!unlocked ? 'opacity-60 grayscale cursor-not-allowed bg-slate-950 border-slate-800' : 'cursor-pointer'}
                      ${unlocked && activeJobId === job.id ? job.color : unlocked ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded">{job.icon}</div>
                      <div>
                        <div className="font-bold text-sm text-slate-200">{job.name}</div>
                        <div className="text-[10px] text-slate-500">{job.stat} Scaled</div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex flex-col items-end">
                      {!unlocked ? (
                        <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-900/50">
                           <Lock size={10} /> Requires {job.realm}
                        </div>
                      ) : (
                        <span className="text-[10px] bg-slate-900/50 px-1.5 rounded text-slate-400 border border-slate-700">{job.realm}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center relative h-48 lg:h-auto">
               <button
                 onClick={handleJobClick}
                 disabled={activeJob.id !== 'wheel' && stamina < 1}
                 style={{ transform: `scale(${clickScale})` }}
                 className={`w-40 h-40 rounded-full border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-75 relative group overflow-hidden ${activeJob.id !== 'wheel' && stamina < 1 ? 'opacity-50 grayscale cursor-not-allowed border-slate-600 bg-slate-800' : 'border-slate-500 bg-slate-800 hover:bg-slate-700'}`}
               >
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="scale-150 mb-2 drop-shadow-md">{activeJob.icon}</div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">{activeJob.name}</span>
                    {activeJob.miniGame && <span className="absolute bottom-6 text-[10px] bg-black/50 px-2 rounded text-cyan-300">Interact</span>}
                 </div>
               </button>
               {effects.map(effect => (
                  <div key={effect.id} className="absolute pointer-events-none animate-[floatUp_1s_ease-out_forwards] z-50 whitespace-nowrap" style={{ left: effect.x, top: effect.y }}>
                    <div className={`text-sm font-bold ${effect.color} drop-shadow-md`}>{effect.content}</div>
                  </div>
                ))}
            </div>

            <div className="flex flex-col justify-between h-full bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                  <Shield size={14} /> Mastery Progress
                </h3>
                {activeJob.yieldsResource ? (
                    <StatBar label={`Level ${masteryData.lvl}`} value={masteryData.xp} max={masteryData.lvl * 100} color={activeJob.type === 'wood' ? 'bg-amber-500' : activeJob.type === 'stone' ? 'bg-slate-400' : 'bg-green-500'} />
                ) : (
                    <div className="text-xs text-slate-500 italic">This activity does not increase labor mastery.</div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
                <p>Stat: {activeJob.stat}</p>
                <div className="flex justify-between items-center mt-1">
                   <span>Yield:</span>
                   <span className="font-bold text-slate-300">{activeJob.yieldsResource ? 'Materials' : activeJob.id === 'fish' ? 'Consumables' : 'Stats & Chi'}</span>
                </div>
                {titleDef.bonusDescription !== 'No bonuses.' && (
                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${titleDef.color}`}>
                        <Award size={10} /> Title: {titleDef.bonusDescription}
                    </div>
                )}
                {background && (
                    <div className="text-[10px] mt-1 flex items-center gap-1 text-slate-400">
                       <User size={10} /> Origin: {background} Bonuses Active
                    </div>
                )}
              </div>
            </div>
         </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Exploration Section */}
      {showWorldMap ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-fantasy text-cyan-100">World Map</h2>
              <p className="text-slate-400">Venture into dangerous biomes.</p>
            </div>
            <Map className="w-12 h-12 text-slate-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BIOMES.map((biome) => {
              const unlocked = isBiomeUnlocked(biome);
              return (
                <div key={biome.name} className={`group relative overflow-hidden rounded-xl border transition-all ${!unlocked ? 'border-red-900/30 bg-slate-900' : 'bg-slate-800 border-slate-700 hover:border-cyan-500'}`}>
                  <div className={`absolute inset-0 bg-cover bg-center transition-opacity ${!unlocked ? 'opacity-5 grayscale' : 'opacity-20 group-hover:opacity-30'}`} style={{ backgroundImage: `url(https://picsum.photos/400/200?random=${biome.difficulty})` }} />
                  <div className="relative p-6 z-10 flex flex-col h-full justify-between min-h-[160px]">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-900/80 backdrop-blur rounded-lg">
                          {!unlocked ? <Lock className="text-slate-500" /> : biome.icon}
                        </div>
                        <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${!unlocked ? 'bg-red-900/30 text-red-400' : 'bg-slate-900/50 text-slate-400'}`}>
                          Tier {biome.difficulty}
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold mb-2 ${!unlocked ? 'text-slate-500' : 'text-white'}`}>{biome.name}</h3>
                        {!unlocked ? (
                          <div className="w-full py-2 bg-slate-900/50 border border-slate-800 text-slate-500 text-center rounded-lg text-sm flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2"><Lock className="w-3 h-3" /> Locked</div>
                            <div className="text-[10px] text-slate-600">Needs {biome.minStage}</div>
                            <div className="text-[10px] text-red-900">Power: {totalPower}/{biome.minPower}</div>
                          </div>
                        ) : (
                          <Button onClick={() => handlePreDungeon(biome)} className="w-full bg-cyan-600/80 hover:bg-cyan-500">
                            Explore Dungeon
                          </Button>
                        )}
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
           <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
           <h3 className="text-xl font-bold mb-2">World Map Locked</h3>
           <p className="text-sm">You are too weak to venture beyond the village.<br/>Reach 50 Total Power to unlock the wilderness.</p>
        </div>
      )}
      
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
