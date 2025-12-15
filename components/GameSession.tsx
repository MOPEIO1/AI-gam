import React, { useState, useEffect } from 'react';
import { User, Scroll, FlaskConical, Compass, Swords, Menu, X, Star, RefreshCw, ShoppingBag, Coins, Backpack, LogOut, Save, ArrowRight, Activity, ArrowUpCircle } from 'lucide-react';
import { Attribute, PlayerStats, GameLogEntry, GameMode, Shard, Scroll as ScrollType, Technique, SaveData, TutorialState, ActiveBuff, CultivationStage, Resources, LaborMastery, InventoryItem, MerchantState, GuideProfile } from '../types';
import { CultivationPanel } from './CultivationPanel';
import { Exploration } from './Exploration';
import { ScrollFusion } from './ScrollFusion';
import { TutorialNPC } from './TutorialNPC';
import { StatBar } from './StatBar';
import { Button } from './Button';
import { CharacterAvatar } from './CharacterAvatar';
import { Market } from './Market';
import { Inventory } from './Inventory';
import { BreakthroughModal } from './BreakthroughModal';
import { SoundManager } from '../utils/SoundManager';
import { checkNewTitles, getTitleDefinition } from '../utils/mechanics';

interface Props {
  saveData: SaveData;
  onSave: (data: SaveData) => void;
  onExit: () => void;
}

const DEFAULT_STATS: PlayerStats = {
  [Attribute.Strength]: 1,
  [Attribute.Agility]: 1,
  [Attribute.Endurance]: 1,
  [Attribute.Chi]: 1,
  [Attribute.Perception]: 1,
  [Attribute.Intelligence]: 1,
  [Attribute.Luck]: 1,
};

export const REALM_REQUIREMENTS: Record<string, number> = {
  [CultivationStage.Mortal]: 0,
  [CultivationStage.BodyTempering]: 50,
  [CultivationStage.QiCondensation]: 150,
  [CultivationStage.Foundation]: 300,
  [CultivationStage.CoreFormation]: 600,
  [CultivationStage.NascentSoul]: 1200,
  [CultivationStage.SoulAscension]: 2500,
  [CultivationStage.ImmortalThreshold]: 5000,
  [CultivationStage.Immortal]: 10000,
  [CultivationStage.Transcendent]: 25000
};

const STAGE_ORDER = [
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

const MERCHANT_MOODS = [
  { name: 'Calm / Serene', mult: 1.0, rarity: 'Common' },
  { name: 'Tense / Anticipatory', mult: 0.9, rarity: 'Common' },
  { name: 'Majestic / Awe-Inspiring', mult: 1.5, rarity: 'Rare' },
  { name: 'Energized / Excited', mult: 1.2, rarity: 'Uncommon' },
  { name: 'Mysterious / Enigmatic', mult: 1.3, rarity: 'Rare' },
  { name: 'Ominous / Foreboding', mult: 0.7, rarity: 'Uncommon' },
  { name: 'Sacred / Spiritual', mult: 2.0, rarity: 'Epic' },
  { name: 'Triumphant / Victorious', mult: 2.5, rarity: 'Legendary' },
  { name: 'Joyful / Lighthearted', mult: 1.15, rarity: 'Uncommon' },
  { name: 'Suspenseful / Uncertain', mult: 0.85, rarity: 'Common' },
  { name: 'Melancholic / Reflective', mult: 0.95, rarity: 'Common' },
  { name: 'Dreamlike / Surreal', mult: 1.4, rarity: 'Rare' },
  { name: 'Eerie / Haunting', mult: 0.6, rarity: 'Uncommon' },
  { name: 'Dark / Sinister', mult: 0.5, rarity: 'Rare' },
  { name: 'Aggressive / Intense', mult: 0.8, rarity: 'Common' },
  { name: 'Playful / Whimsical', mult: 1.1, rarity: 'Uncommon' },
  { name: 'Hopeful / Uplifting', mult: 1.25, rarity: 'Uncommon' },
  { name: 'Introspective / Thoughtful', mult: 1.05, rarity: 'Common' },
  { name: 'Lonely / Isolated', mult: 0.75, rarity: 'Common' },
  { name: 'Chaotic / Frenzied', mult: 3.0, rarity: 'Legendary' }
];

const AVAILABLE_GUIDES: GuideProfile[] = [
  { 
    name: "Master Li Shen", 
    race: "Human Sage", 
    voiceName: "Charon", 
    avatarSeed: "LiShen_Sage_v2", 
    portraitUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=LiShen_Sage_v2&backgroundColor=transparent&mouth=serious&eyebrows=serious", 
    speechRate: 1.0, 
    color: "text-amber-400" 
  },
  { 
    name: "Lady Elara", 
    race: "High Elf", 
    voiceName: "Kore",
    avatarSeed: "Elara_Mystic_v3", 
    portraitUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=Elara_Mystic_v3&backgroundColor=transparent&mouth=sad01&eyes=variant04", 
    speechRate: 1.1, 
    color: "text-cyan-400" 
  },
  { 
    name: "General Thorgar", 
    race: "Dwarf Warlord", 
    voiceName: "Fenrir",
    avatarSeed: "Thorgar_War_v2", 
    portraitUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=Thorgar_War_v2&backgroundColor=transparent&beard=variant02&hair=short12", 
    speechRate: 0.9, 
    color: "text-red-400" 
  },
  { 
    name: "Seraphina Void", 
    race: "Nether Witch", 
    voiceName: "Aoede",
    avatarSeed: "Seraphina_Dark_v4", 
    portraitUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=Seraphina_Dark_v4&backgroundColor=transparent&hair=long16&eyes=variant10", 
    speechRate: 1.05, 
    color: "text-purple-400" 
  }
];

export const GameSession: React.FC<Props> = ({ saveData, onSave, onExit }) => {
  const [stats, setStats] = useState<PlayerStats>(saveData.stats || DEFAULT_STATS);
  const [potential, setPotential] = useState(saveData.potential || 0);
  const [isAwakened, setIsAwakened] = useState(saveData.isAwakened || false);
  const [activeTab, setActiveTab] = useState<GameMode>(GameMode.Cultivate);
  const [logs, setLogs] = useState<GameLogEntry[]>(saveData.logs || []);
  const [shards, setShards] = useState<Shard[]>(saveData.shards || []);
  const [scrolls, setScrolls] = useState<ScrollType[]>(saveData.scrolls || []);
  const [techniques, setTechniques] = useState<Technique[]>(saveData.techniques || []);
  const [currency, setCurrency] = useState(saveData.currency || 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tutorialState, setTutorialState] = useState<TutorialState>(saveData.tutorialState || 'intro');
  const [npcMessage, setNpcMessage] = useState<string | null>(null);
  const [activeBuff, setActiveBuff] = useState<ActiveBuff | null>(saveData.activeBuff || null);
  
  const [resources, setResources] = useState<Resources>(saveData.resources || { wood: 0, stone: 0, herbs: 0 });
  const [laborMastery, setLaborMastery] = useState<LaborMastery>(saveData.laborMastery || { woodcutting: 1, mining: 1, gathering: 1, woodcuttingXp: 0, miningXp: 0, gatheringXp: 0 });
  const [stamina, setStamina] = useState<number>(saveData.stamina !== undefined ? saveData.stamina : 100);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(saveData.inventoryItems || []);
  const [bottleneck, setBottleneck] = useState(saveData.bottleneck || false);
  const [showBreakthrough, setShowBreakthrough] = useState(false);
  
  // Avatar Customization State
  const [avatarLook, setAvatarLook] = useState<string>('default');
  
  // Title System
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>(saveData.titles || ['mortal']);
  const [equippedTitle, setEquippedTitle] = useState<string>(saveData.equippedTitle || 'mortal');
  
  const [merchant, setMerchant] = useState<MerchantState>(saveData.merchant || { moodName: 'Neutral', moodMultiplier: 1, moodRarity: 'Common', lastUpdate: 0, scrollsBought: 0, resourcePrices: { wood: 5, stone: 5, herbs: 5 } });
  
  // Initialize Guide with Force Migration
  const [guide, setGuide] = useState<GuideProfile>(() => {
    if (saveData.guide) {
      const match = AVAILABLE_GUIDES.find(g => g.name === saveData.guide!.name);
      if (match) return match;
      return saveData.guide;
    }
    const randomIndex = Math.floor(Math.random() * AVAILABLE_GUIDES.length);
    return AVAILABLE_GUIDES[randomIndex];
  });

  const [officialStage, setOfficialStage] = useState<CultivationStage>(CultivationStage.Mortal);

  const maxStamina = 100 + ((stats[Attribute.Endurance] as number) * 5);
  const totalPower = (Object.values(stats) as number[]).reduce((a, b) => a + b, 0);
  const maxPotential = 100 + (totalPower * 2);
  const activeTitleDef = getTitleDefinition(equippedTitle);

  // Lock UI during critical tutorial phases
  const isTutorialLock = ['intro', 'explain_goal', 'explain_action', 'explain_meditation'].includes(tutorialState);

  useEffect(() => {
    let stage = CultivationStage.Mortal;
    for (let i = 0; i < STAGE_ORDER.length; i++) {
        const s = STAGE_ORDER[i];
        const req = REALM_REQUIREMENTS[s] as number;
        const statsValues = Object.values(stats) as number[];
        const hasStats = statsValues.every((val) => val >= req);
        
        if (hasStats) {
            stage = s;
        } else {
            break; 
        }
    }
    setOfficialStage(stage);
  }, [stats]);

  useEffect(() => {
    // Force sound initialization on any interaction
    const unlockAudio = () => {
        SoundManager.init();
        SoundManager.startBGM(); 
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
    
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    
    SoundManager.startBGM();
    return () => SoundManager.stopBGM();
  }, []);

  // Title Unlocking Logic
  useEffect(() => {
    const newTitles = checkNewTitles(stats, laborMastery, officialStage, unlockedTitles);
    if (newTitles.length > 0) {
        setUnlockedTitles(prev => [...prev, ...newTitles]);
        newTitles.forEach(tID => {
            const def = getTitleDefinition(tID);
            addLog({ 
                id: Date.now().toString(), 
                timestamp: new Date(), 
                message: `Title Unlocked: ${def.name} - ${def.bonusDescription}`, 
                type: 'legendary' 
            });
            SoundManager.playSuccess();
        });
        if (equippedTitle === 'mortal' && newTitles.length > 0) {
            setEquippedTitle(newTitles[0]);
        }
    }
  }, [stats, laborMastery, officialStage]);

  useEffect(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - merchant.lastUpdate > oneDay) {
        const randomMood = MERCHANT_MOODS[Math.floor(Math.random() * MERCHANT_MOODS.length)];
        
        const basePrices = { wood: 5, stone: 8, herbs: 10 };
        const newPrices = {
            wood: Math.max(1, Math.floor(basePrices.wood * randomMood.mult)),
            stone: Math.max(1, Math.floor(basePrices.stone * randomMood.mult)),
            herbs: Math.max(1, Math.floor(basePrices.herbs * randomMood.mult))
        };

        const newMerchantState: MerchantState = {
            moodName: randomMood.name,
            moodMultiplier: randomMood.mult,
            moodRarity: randomMood.rarity as any,
            lastUpdate: now,
            scrollsBought: 0, 
            resourcePrices: newPrices
        };
        setMerchant(newMerchantState);
        addLog({ id: Date.now().toString(), timestamp: new Date(), message: `Merchant Arrives: He seems ${randomMood.name} today.`, type: 'info' });
        SoundManager.setGenreByDate(); 
    }
  }, [merchant]);

  useEffect(() => {
    const currentIndex = STAGE_ORDER.indexOf(officialStage);
    const nextStageName = STAGE_ORDER[currentIndex + 1];
    
    if (nextStageName && !bottleneck) {
       const req = REALM_REQUIREMENTS[nextStageName] as number;
       const readyForNext = (Object.values(stats) as number[]).every((val) => val >= req);
       
       if (readyForNext) {
          setBottleneck(true);
          addLog({ 
              id: Date.now().toString(), 
              timestamp: new Date(), 
              message: `Your cultivation has reached a peak. You must Breakthrough to enter the ${nextStageName}.`, 
              type: 'danger' 
          });
          SoundManager.playClick(); 
       }
    }
  }, [stats, officialStage, bottleneck]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleManualSave();

      setStamina(prev => {
        let regen = 5 + Math.floor(stats[Attribute.Endurance] / 2); 
        if (equippedTitle === 'iron_wall') regen += 1; // Title Bonus
        return Math.min(prev + regen, maxStamina);
      });

      // Automation Yields (Auto-clicker > 20 Mastery)
      setResources(prev => {
        const next = { ...prev };
        if (laborMastery.woodcutting >= 20) {
          const gain = 0.05 + (stats[Attribute.Strength] * 0.005);
          next.wood += gain;
        }
        if (laborMastery.mining >= 20) {
          const gain = 0.05 + (stats[Attribute.Endurance] * 0.005);
          next.stone += gain;
        }
        if (laborMastery.gathering >= 20) {
          const gain = 0.05 + (stats[Attribute.Perception] * 0.005);
          next.herbs += gain;
        }
        return next;
      });

    }, 5000); 
    return () => clearInterval(timer);
  }, [stats, potential, logs, shards, scrolls, techniques, currency, tutorialState, activeBuff, resources, laborMastery, stamina, inventoryItems, bottleneck, merchant, equippedTitle]);

  useEffect(() => {
    if (activeBuff) {
      const remaining = activeBuff.expiresAt - Date.now();
      if (remaining <= 0) {
        setActiveBuff(null);
        addLog({ id: Date.now().toString(), timestamp: new Date(), message: `The effects of ${activeBuff.name} have faded.`, type: 'info' });
      } else {
        const timer = setTimeout(() => {
          setActiveBuff(null);
          addLog({ id: Date.now().toString(), timestamp: new Date(), message: `The effects of ${activeBuff.name} have faded.`, type: 'info' });
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [activeBuff]);

  useEffect(() => {
    switch (tutorialState) {
      case 'intro':
        setNpcMessage(`Greetings, young one. I am ${guide.name}. The path of cultivation is long and treacherous. You must balance your body and mind.`);
        break;
      case 'explain_goal':
        setNpcMessage("To survive the wilderness, you need power. Train your attributes to total level 50.");
        break;
      case 'explain_action':
        setNpcMessage("To gain power, you need wealth. Your hands are your first tools.");
        break;
      case 'explain_meditation':
        setNpcMessage("But first, the mind. Meditating aligns your Chi and multiplies your gains.");
        break;
      case 'open_explore':
        setNpcMessage("Go to 'Explore & Labor'. Gather resources like Wood and Stone.");
        break;
      case 'work_labor':
        setNpcMessage("Labor builds character. Gather resources until your bag is heavy.");
        break;
      case 'open_market':
        setNpcMessage("Now, to the Spirit Pavilion. The merchant awaits your goods.");
        break;
      case 'visit_market':
        setNpcMessage("The market fluctuates daily. Sell your goods and acquire 90 Coins to buy Scrolls.");
        break;
      case 'open_scrolls':
        setNpcMessage("You have the scrolls. Open your study chamber to begin.");
        break;
      case 'fusion_intro':
        setNpcMessage("Scrolls contain fragments of power. Combine two to create a Technique.");
        break;
      case 'select_scrolls':
        setNpcMessage("Select two scrolls from your bag. Their elements will merge.");
        break;
      case 'click_fuse':
        setNpcMessage("Now... FUSE THEM! Unleash your Chi!");
        break;
    }
  }, [tutorialState, guide.name]);

  const handleManualSave = () => {
    const currentData: SaveData = {
      ...saveData,
      stats,
      potential,
      isAwakened,
      logs,
      shards,
      scrolls,
      techniques,
      currency,
      tutorialState,
      lastPlayedAt: Date.now(),
      activeBuff: activeBuff,
      resources,
      laborMastery,
      stamina,
      inventoryItems,
      bottleneck,
      merchant,
      guide,
      titles: unlockedTitles,
      equippedTitle
    };
    onSave(currentData);
  };

  const handleExit = () => {
    handleManualSave();
    onExit();
  };

  const addLog = (entry: GameLogEntry) => {
    setLogs(prev => [entry, ...prev].slice(0, 10));
  };

  const handleTabChange = (mode: GameMode) => {
    if (isTutorialLock) return; // Prevent tab switching if locked
    SoundManager.playClick();
    setActiveTab(mode);
    setMobileMenuOpen(false);

    if (tutorialState === 'open_explore' && mode === GameMode.Explore) setTutorialState('work_labor');
    if (tutorialState === 'open_market' && mode === GameMode.Market) setTutorialState('visit_market');
    if (tutorialState === 'open_scrolls' && mode === GameMode.Scrolls) setTutorialState('fusion_intro');
  };

  const cycleAvatarStyle = () => {
      SoundManager.playClick();
      const styles = ['default', 'alchemist', 'warrior', 'shadow'];
      const currentIdx = styles.indexOf(avatarLook);
      const nextIdx = (currentIdx + 1) % styles.length;
      setAvatarLook(styles[nextIdx]);
      addLog({ id: Date.now().toString(), timestamp: new Date(), message: `Appearance changed to ${styles[nextIdx]} style.`, type: 'info' });
  };

  const advanceTutorial = () => {
    switch (tutorialState) {
      case 'intro': setTutorialState('explain_goal'); break;
      case 'explain_goal': setTutorialState('explain_action'); break;
      case 'explain_action': setTutorialState('explain_meditation'); break;
      case 'explain_meditation': setTutorialState('open_explore'); break;
      case 'fusion_intro': setTutorialState('select_scrolls'); break;
      case 'fusion_success': 
        setTutorialState('completed');
        addLog({ id: Date.now().toString(), timestamp: new Date(), message: "Tutorial Complete!", type: 'legendary' });
        setNpcMessage(null); 
        break;
      default: setNpcMessage(null); break;
    }
  };

  const handleFindShard = (shard: Shard) => {
    setShards(prev => {
      const idx = prev.findIndex(s => s.element === shard.element);
      if (idx >= 0) {
        const newShards = [...prev];
        newShards[idx] = { ...newShards[idx], quantity: newShards[idx].quantity + shard.quantity };
        return newShards;
      }
      return [...prev, shard];
    });
    addLog({ id: Date.now().toString(), timestamp: new Date(), message: `Found ${shard.quantity} ${shard.element} Shard`, type: 'success' });
    SoundManager.playSuccess();
  };

  const handleEarnCurrency = (amount: number) => {
    setCurrency(prev => prev + amount);
  };

  const handleLaborComplete = (action: string) => {
    if (tutorialState === 'work_labor' && (resources.wood > 1 || resources.stone > 1 || resources.herbs > 1)) {
       // logic handled elsewhere
    }
  };

  const handleBuyScroll = (scroll: ScrollType, price: number) => {
    if (scrolls.length >= 5) {
      addLog({ id: Date.now().toString(), timestamp: new Date(), message: "Your scroll bag is full!", type: 'danger' });
      return;
    }
    if (currency >= price) {
      SoundManager.playClick(); 
      setCurrency(prev => prev - price);
      setScrolls(prev => {
        const newScrolls = [...prev, scroll];
        if (tutorialState === 'visit_market' && newScrolls.length >= 2) setTutorialState('open_scrolls');
        return newScrolls;
      });
      // Increment buy count
      setMerchant(prev => ({
          ...prev,
          scrollsBought: prev.scrollsBought + 1
      }));
      addLog({ id: Date.now().toString(), timestamp: new Date(), message: `Purchased scroll: ${scroll.name}`, type: 'success' });
    }
  };

  const handleTechniqueCreated = (newTech: Technique) => {
    setTechniques(prev => [...prev, newTech]);
    addLog({ id: Date.now().toString(), timestamp: new Date(), message: `Created technique: ${newTech.name}`, type: 'legendary' });
    if (tutorialState === 'click_fuse' || tutorialState === 'select_scrolls') setTutorialState('fusion_success');
  };

  const handleSellScroll = (scrollId: string, price: number) => {
    SoundManager.playClick();
    setScrolls(prev => prev.filter(s => s.id !== scrollId));
    setCurrency(prev => prev + Math.floor(price * 0.25));
  };

  const handleSellTechnique = (techId: string, estimatedValue: number = 100) => {
    SoundManager.playClick();
    setTechniques(prev => prev.filter(t => t.id !== techId));
    setCurrency(prev => prev + Math.floor(estimatedValue * 0.25));
  };

  const handleSellItem = (item: InventoryItem) => {
    const finalPrice = Math.ceil(item.value * merchant.moodMultiplier);
    SoundManager.playClick();
    setInventoryItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (!exists) return prev;
      if (exists.quantity > 1) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
      else return prev.filter(i => i.id !== item.id);
    });
    setCurrency(prev => prev + finalPrice);
    addLog({ id: Date.now().toString(), timestamp: new Date(), message: `Sold ${item.name} for ${finalPrice} coins.`, type: 'info' });
  };

  const handleAddItems = (newItems: InventoryItem[]) => {
    setInventoryItems(prev => {
      const updated = [...prev];
      newItems.forEach(newItem => {
        const existing = updated.find(i => i.name === newItem.name);
        if (existing) existing.quantity += newItem.quantity;
        else updated.push(newItem);
      });
      return updated;
    });
  };

  const handleEquipTechnique = (techId: string) => {
     SoundManager.playClick();
     setTechniques(prev => {
      const tech = prev.find(t => t.id === techId);
      if (!tech) return prev;
      if (tech.equipped) return prev.map(t => t.id === techId ? { ...t, equipped: false } : t);
      const equippedCount = prev.filter(t => t.equipped).length;
      if (equippedCount >= 3) return prev;
      return prev.map(t => t.id === techId ? { ...t, equipped: true } : t);
    });
  };

  const handleMasteryIncrease = (techId: string) => {
     setTechniques(prev => prev.map(t => {
      if (t.id === techId) {
        if (t.mastery >= t.maxMastery) return t;
        return { ...t, mastery: Math.min(t.maxMastery, t.mastery + 5) };
      }
      return t;
    }));
  };

  const handleUpdateResources = (newResources: Resources) => setResources(newResources);
  const handleUpdateMastery = (newMastery: LaborMastery) => setLaborMastery(newMastery);
  const handleUpdateStamina = (newStamina: number) => setStamina(newStamina);

  const handleTrain = (stat: Attribute, amount: number, lore: string) => {
    let multiplier = 1;
    if (isAwakened) multiplier *= 2;
    if (activeBuff && activeBuff.affectedStats.includes(stat)) multiplier *= activeBuff.multiplier;
    
    if (equippedTitle === 'ascendant') multiplier *= 2; 

    if (bottleneck) {
       multiplier *= 0.05;
       if (Math.random() < 0.1) addLog({ id: Date.now().toString(), timestamp: new Date(), message: "Bottleneck reached. Cultivation is ineffective.", type: 'danger' });
    }

    const totalGain = amount * multiplier;
    setStats(prev => ({ ...prev, [stat]: prev[stat] + totalGain }));
    setPotential(prev => Math.min(prev + 5, maxPotential));
    if (lore) addLog({ id: Date.now().toString(), timestamp: new Date(), message: lore, type: 'info' });
  };

  const handleMeditate = (buff: ActiveBuff) => {
    SoundManager.playSuccess();
    setActiveBuff(buff);
    addLog({ id: Date.now().toString(), timestamp: new Date(), message: `You enter the state of ${buff.name}.`, type: 'info' });
  };

  const toggleAwakened = () => {
    if (bottleneck) {
      setShowBreakthrough(true);
      return;
    }

    if (potential >= maxPotential) {
      SoundManager.playSuccess();
      setIsAwakened(true);
      setPotential(0);
      addLog({ id: Date.now().toString(), timestamp: new Date(), message: "You have entered Awakened State!", type: 'legendary' });
      setTimeout(() => {
        setIsAwakened(false);
        addLog({ id: Date.now().toString(), timestamp: new Date(), message: "Your awakened energy dissipates.", type: 'info' });
      }, 30000);
    }
  };

  const handleBreakthroughSuccess = () => {
     setShowBreakthrough(false);
     setBottleneck(false);
     setPotential(0);
     setStats(prev => {
        const newStats = {...prev};
        for (const k in newStats) {
           newStats[k as Attribute] = Math.floor(newStats[k as Attribute] * 1.1) + 10;
        }
        return newStats;
     });
     addLog({ id: Date.now().toString(), timestamp: new Date(), message: "HEAVENS SHAKEN! You have successfully broken through!", type: 'legendary' });
  };

  const handleBreakthroughFail = () => {
     setShowBreakthrough(false);
     setStamina(0); 
     addLog({ id: Date.now().toString(), timestamp: new Date(), message: "Breakthrough failed! Your foundation is damaged and energy drained.", type: 'danger' });
  };

  const SidebarItem = ({ mode, icon, label, isHighlighted = false }: { mode: GameMode, icon: React.ReactNode, label: string, isHighlighted?: boolean }) => (
    <button
      onClick={() => handleTabChange(mode)}
      disabled={isTutorialLock}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all relative ${
        activeTab === mode 
          ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-tech tracking-wide' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      } ${isHighlighted ? 'ring-1 ring-amber-400 animate-pulse bg-amber-900/10' : ''}
      ${isTutorialLock ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      {isHighlighted && <ArrowRight className="w-4 h-4 text-amber-400 animate-bounce" />}
    </button>
  );
  
  const nextRealmMax = REALM_REQUIREMENTS[STAGE_ORDER[STAGE_ORDER.indexOf(officialStage) + 1] || CultivationStage.Transcendent] as number;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden ${isAwakened ? 'awakened-mode border-4 border-transparent' : ''}`}>
      
      {showBreakthrough && (
         <BreakthroughModal 
            currentStage={officialStage} 
            nextStage={STAGE_ORDER[STAGE_ORDER.indexOf(officialStage) + 1] || CultivationStage.Transcendent}
            onSuccess={handleBreakthroughSuccess}
            onFail={handleBreakthroughFail}
         />
      )}

      {npcMessage && (
        <TutorialNPC 
          message={npcMessage}
          onNext={advanceTutorial}
          onClose={() => setNpcMessage(null)}
          actionRequired={['open_explore', 'work_labor', 'open_market', 'visit_market', 'open_scrolls', 'navigate_scrolls', 'select_scrolls', 'click_fuse'].includes(tutorialState)}
          canDismiss={tutorialState === 'completed'}
          guide={guide}
        />
      )}

      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <h1 className="text-xl font-fantasy text-cyan-400">Celestial Ascension</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className={`flex flex-col md:flex-row max-w-7xl mx-auto h-screen-md md:h-screen overflow-hidden transition-all duration-500 ${isTutorialLock ? 'pointer-events-none blur-[2px] opacity-80' : ''}`}>
        
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-72 bg-slate-900/50 border-r border-slate-800 p-6 flex-shrink-0 absolute md:relative z-40 h-full flex flex-col backdrop-blur-sm`}>
           <div className="mb-4 hidden md:flex justify-between items-center text-xs text-slate-500 font-mono">
               <span>VER 2.0.5</span>
               <div className="flex gap-2">
                 <button onClick={handleManualSave} title="Save Data" className="hover:text-cyan-400 transition-colors"><Save size={12} /></button>
                 <button onClick={handleExit} title="Logout" className="hover:text-red-400 transition-colors"><LogOut size={12} /></button>
               </div>
          </div>

          <div className="mb-6 flex flex-col items-center text-center">
            {/* Player Card UI */}
            <CharacterAvatar 
                stats={stats} 
                isAwakened={isAwakened} 
                size="xl" 
                className="mb-4" 
                seedOverride={`Hunter_${saveData.background}_${officialStage}`} 
                onCustomize={cycleAvatarStyle}
                customLook={avatarLook}
            />
            
            <div className="w-full text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-1">
                  {bottleneck && <Activity size={16} className="text-red-500 animate-pulse"/>}
               </div>
               <div className="text-xl font-bold text-slate-100 font-fantasy tracking-wide">{saveData.name}</div>
               <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1">{saveData.background}</div>
               <div className="text-sm text-amber-400 font-serif border-t border-slate-800/50 pt-2 mt-1">{officialStage}</div>
            </div>
            
            <div className={`mt-3 w-full text-center text-[10px] uppercase font-bold px-2 py-1 rounded border bg-slate-950/50 ${activeTitleDef.color.replace('text-', 'border-').replace('500', '900')} ${activeTitleDef.color}`}>
               Title: {activeTitleDef.name}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <div className="text-xs font-bold text-slate-600 uppercase mb-2 pl-2">Navigation</div>
            <SidebarItem mode={GameMode.Cultivate} icon={<User size={16}/>} label="Status & Cultivation" />
            <SidebarItem mode={GameMode.Explore} icon={<Compass size={16}/>} label="Dungeons & Labor" isHighlighted={tutorialState === 'open_explore'} />
            <SidebarItem mode={GameMode.Inventory} icon={<Backpack size={16}/>} label="Item Storage" />
            <SidebarItem mode={GameMode.Market} icon={<ShoppingBag size={16}/>} label="Exchange Shop" isHighlighted={tutorialState === 'open_market'} />
            {scrolls.length > 0 && (
                <SidebarItem mode={GameMode.Scrolls} icon={<Scroll size={16}/>} label="Skill Synthesis" isHighlighted={tutorialState === 'open_scrolls'} />
            )}
            {(totalPower as number) > 500 && (
               <SidebarItem mode={GameMode.Alchemy} icon={<FlaskConical size={16}/>} label="Alchemy Lab" />
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/50">
             {bottleneck ? (
               <Button 
                  variant='danger'
                  className="w-full animate-pulse border-red-500/50 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.3)] font-tech tracking-widest"
                  onClick={() => setShowBreakthrough(true)}
               >
                  LIMIT BREAK
               </Button>
             ) : (
               <Button 
                  variant={isAwakened ? 'secondary' : 'primary'}
                  className={`w-full font-tech tracking-widest ${isAwakened ? 'border-yellow-500 text-yellow-500' : 'bg-cyan-900/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/40'}`}
                  onClick={toggleAwakened}
                  disabled={potential < maxPotential && !isAwakened}
               >
                  {isAwakened ? 'AWAKENED MODE' : 'AWAKEN'}
               </Button>
             )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
           {isAwakened && (
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent mix-blend-screen" />
             </div>
           )}

           <div className="max-w-5xl mx-auto relative z-10">
              {activeTab === GameMode.Cultivate && (
                <CultivationPanel 
                  stats={stats} 
                  potential={potential} 
                  maxPotential={maxPotential}
                  activeBuff={activeBuff}
                  onMeditate={handleMeditate}
                />
              )}

              {activeTab === GameMode.Explore && (
                <Exploration 
                  stats={stats} 
                  onAddLog={addLog}
                  onFindShard={handleFindShard}
                  onEarnCurrency={handleEarnCurrency}
                  onTrainStat={(stat, amt) => handleTrain(stat, amt, "")}
                  tutorialActive={tutorialState === 'work_labor'}
                  onActionComplete={handleLaborComplete}
                  currentStage={officialStage}
                  resources={resources}
                  laborMastery={laborMastery}
                  stamina={stamina}
                  setResources={handleUpdateResources}
                  setLaborMastery={handleUpdateMastery}
                  setStamina={handleUpdateStamina}
                  onAddItems={handleAddItems}
                  equippedTitle={equippedTitle}
                  scrolls={scrolls}
                  techniques={techniques}
                  avatarSeed={`Hunter_${saveData.background}_${officialStage}`}
                  background={saveData.background}
                />
              )}

              {activeTab === GameMode.Inventory && (
                <Inventory 
                  shards={shards} 
                  currency={currency} 
                  resources={resources} 
                  inventoryItems={inventoryItems}
                  onSellItem={handleSellItem}
                />
              )}

              {activeTab === GameMode.Market && (
                <Market 
                  currency={currency} 
                  onBuy={handleBuyScroll} 
                  playerLevel={Math.floor((totalPower as number) / 10)} 
                  tutorialActive={tutorialState === 'visit_market'}
                  inventoryCount={scrolls.length}
                  merchantState={merchant}
                  resources={resources}
                  setResources={setResources}
                  onEarnCurrency={handleEarnCurrency}
                  tutorialStep={tutorialState}
                  setTutorialStep={setTutorialState}
                  ownedScrolls={scrolls} 
                />
              )}

              {activeTab === GameMode.Scrolls && (
                 <ScrollFusion 
                   inventory={scrolls}
                   techniques={techniques}
                   chiLevel={stats[Attribute.Chi]}
                   onTechniqueCreated={handleTechniqueCreated}
                   tutorialActive={['select_scrolls', 'click_fuse'].includes(tutorialState)}
                   tutorialStep={tutorialState === 'click_fuse' ? 'click_fuse' : 'selection'}
                   onTutorialAction={(action, data) => {
                     if (action === 'fused') setTutorialState('fusion_success');
                     if (action === 'selection_changed') {
                        if (data.count === 2 && tutorialState === 'select_scrolls') setTutorialState('click_fuse');
                        if (data.count < 2 && tutorialState === 'click_fuse') setTutorialState('select_scrolls');
                     }
                   }}
                   onTrain={(stat, amt) => handleTrain(stat, amt, "Study: Your understanding deepens.")}
                   onSellScroll={handleSellScroll}
                   onSellTechnique={handleSellTechnique}
                   onEquipTechnique={handleEquipTechnique}
                   onMasteryIncrease={handleMasteryIncrease}
                   onActivateBuff={handleMeditate}
                 />
              )}

              {activeTab === GameMode.Alchemy && (
                <div className="space-y-6 animate-in fade-in">
                  <h2 className="text-3xl font-fantasy text-cyan-100">Alchemy Lab</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {shards.length === 0 ? (
                      <div className="col-span-full text-slate-500 text-center py-12">
                        No elemental shards found yet. Check your Inventory or Explore more!
                      </div>
                    ) : (
                      shards.map((s) => (
                        <div key={s.id + s.element} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mb-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                          </div>
                          <span className="font-bold">{s.element} Shard</span>
                          <span className="text-xs text-slate-400">x{s.quantity}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
           </div>
        </main>

        {activeTab !== GameMode.Cultivate && (
          <aside className="hidden xl:block w-72 bg-slate-900/30 border-l border-slate-800 p-6 flex-shrink-0 overflow-y-auto backdrop-blur-sm">
            <h3 className="font-tech text-cyan-500 mb-4 uppercase tracking-widest text-sm border-b border-cyan-900/50 pb-2">
               Attribute Analysis
            </h3>
            <div className="space-y-4 mb-8">
              <StatBar label="Strength" value={stats[Attribute.Strength]} max={nextRealmMax} color="bg-orange-500" />
              <StatBar label="Agility" value={stats[Attribute.Agility]} max={nextRealmMax} color="bg-yellow-500" />
              <StatBar label="Endurance" value={stats[Attribute.Endurance]} max={nextRealmMax} color="bg-green-500" />
              <StatBar label="Chi" value={stats[Attribute.Chi]} max={nextRealmMax} color="bg-cyan-500" />
              <StatBar label="Perception" value={stats[Attribute.Perception]} max={nextRealmMax} color="bg-purple-500" />
              <StatBar label="Intelligence" value={stats[Attribute.Intelligence]} max={nextRealmMax} color="bg-blue-500" />
              <StatBar label="Luck" value={stats[Attribute.Luck]} max={nextRealmMax} color="bg-emerald-400" />
            </div>

            <div className="mb-6 p-4 bg-amber-900/10 border border-amber-500/30 rounded-lg">
              <div className="text-xs text-amber-500 uppercase font-bold mb-1">Spirit Coins</div>
              <div className="text-2xl font-fantasy text-amber-300 flex items-center gap-2">
                {currency} <Coins className="w-5 h-5" />
              </div>
            </div>

            <h3 className="font-tech text-slate-400 mb-4 uppercase tracking-widest text-sm border-b border-slate-800 pb-2">
               System Logs
            </h3>
            <div className="space-y-3 font-mono">
              {logs.length === 0 && <p className="text-xs text-slate-600">Your journey begins...</p>}
              {logs.map((log) => (
                <div key={log.id} className="text-[10px] border-l-2 border-slate-800 pl-3 py-1 relative">
                  <span className="text-slate-600 block mb-0.5">{log.timestamp instanceof Date ? log.timestamp.toLocaleTimeString() : new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`${log.type === 'legendary' ? 'text-yellow-400 font-bold' : log.type === 'success' ? 'text-green-400' : 'text-slate-400'}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};