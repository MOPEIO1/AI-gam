
export enum Attribute {
  Strength = 'Strength',
  Agility = 'Agility',
  Endurance = 'Endurance',
  Chi = 'Chi',
  Perception = 'Perception',
  Intelligence = 'Intelligence',
  Luck = 'Luck'
}

export interface PlayerStats {
  [Attribute.Strength]: number;
  [Attribute.Agility]: number;
  [Attribute.Endurance]: number;
  [Attribute.Chi]: number;
  [Attribute.Perception]: number;
  [Attribute.Intelligence]: number;
  [Attribute.Luck]: number;
}

export enum CultivationStage {
  Mortal = 'Mortal Realm',
  BodyTempering = 'Body Tempering',
  QiCondensation = 'Qi Condensation',
  Foundation = 'Foundation Est.',
  CoreFormation = 'Core Formation',
  NascentSoul = 'Nascent Soul',
  SoulAscension = 'Soul Ascension',
  ImmortalThreshold = 'Immortal Threshold',
  Immortal = 'Immortal Realm',
  Transcendent = 'Transcendent Realm'
}

export enum ItemType {
  Scroll = 'Scroll',
  Shard = 'Shard',
  Potion = 'Potion',
  Resource = 'Resource',
  Treasure = 'Treasure'
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  value: number; // Sell price
  type: ItemType;
  rarity: Rarity;
}

export interface Scroll {
  id: string;
  name: string;
  description: string;
  element?: string;
  type: 'Offensive' | 'Defensive' | 'Movement' | 'Utility';
  mastery: number; // 0-100
  requiredStat: Attribute;
  requiredLevel: number;
  rarity: Rarity;
  price: number;
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  visualEffect: string;
  components: string[]; // Names of source scrolls
  mastery: number;
  maxMastery: number; // Threshold for next variation
  rank: string; // e.g. Mortal, Earth, Heaven, Divine
  damageMultiplier: number;
  synergy?: string;
  ultimateEffect?: string;
  equipped?: boolean; 
  rarity?: Rarity; 
}

export interface Shard {
  id: string;
  element: 'Fire' | 'Water' | 'Metal' | 'Wood' | 'Earth' | 'Lightning';
  quantity: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'success' | 'danger' | 'info' | 'legendary';
}

export enum GameMode {
  Cultivate = 'Cultivate',
  Scrolls = 'Scrolls',
  Alchemy = 'Alchemy',
  Explore = 'Explore',
  Profile = 'Profile',
  Market = 'Market',
  Inventory = 'Inventory'
}

export type TutorialState = 
  | 'idle' 
  | 'intro'
  | 'explain_goal'
  | 'explain_action'
  | 'explain_meditation'
  | 'open_explore'
  | 'work_labor'
  | 'open_market'
  | 'visit_market'
  | 'open_scrolls'
  | 'navigate_scrolls' 
  | 'fusion_intro' 
  | 'select_scrolls' 
  | 'click_fuse' 
  | 'fusion_success' 
  | 'completed';

export interface ActiveBuff {
  name: string;
  description: string;
  multiplier: number;
  affectedStats: Attribute[];
  expiresAt: number; // Timestamp
}

export interface LaborMastery {
  woodcutting: number; // Level
  mining: number;
  gathering: number;
  woodcuttingXp: number;
  miningXp: number;
  gatheringXp: number;
}

export interface Resources {
  wood: number;
  stone: number;
  herbs: number;
}

export interface MerchantState {
  moodName: string;
  moodMultiplier: number; // e.g. 0.8 to 2.5
  moodRarity: Rarity;
  lastUpdate: number;
  scrollsBought: number; // Track daily limit
  resourcePrices: {
    wood: number;
    stone: number;
    herbs: number;
  };
}

export interface GuideProfile {
  name: string;
  race: string;
  voiceName: string; // Gemini Voice Name
  avatarSeed: string; // DiceBear Seed
  portraitUrl: string; // High quality image URL
  speechRate: number; // 1.0 = normal, 1.2 = faster
  color: string;
}

export interface SaveData {
  id: string; // slot id (1, 2, or 3)
  name: string;
  background: string;
  stats: PlayerStats;
  potential: number;
  isAwakened: boolean;
  logs: GameLogEntry[];
  shards: Shard[];
  scrolls: Scroll[];
  techniques: Technique[];
  currency: number;
  tutorialState: TutorialState;
  createdAt: number;
  lastPlayedAt: number;
  activeBuff?: ActiveBuff | null;
  resources: Resources;
  laborMastery: LaborMastery;
  stamina: number; 
  inventoryItems: InventoryItem[]; 
  bottleneck?: boolean; 
  merchant?: MerchantState; 
  guide?: GuideProfile; 
  titles: string[]; // List of unlocked title IDs
  equippedTitle?: string;
  destinyRerolls?: number; // Track rerolls used during creation if we persist it, or just for session
}
