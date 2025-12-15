import React, { useState, useEffect } from 'react';
import { SaveData, Attribute, PlayerStats } from './types';
import { MainMenu } from './components/MainMenu';
import { CharacterCreation } from './components/CharacterCreation';
import { GameSession } from './components/GameSession';
import { WelcomeScreen } from './components/WelcomeScreen';

const STORAGE_KEY = 'celestial_ascension_saves_v2';

const INITIAL_STATS: PlayerStats = {
  [Attribute.Strength]: 1,
  [Attribute.Agility]: 1,
  [Attribute.Endurance]: 1,
  [Attribute.Chi]: 1,
  [Attribute.Perception]: 1,
  [Attribute.Intelligence]: 1,
  [Attribute.Luck]: 1,
};

const App: React.FC = () => {
  const [view, setView] = useState<'WELCOME' | 'MENU' | 'CREATE' | 'GAME'>('WELCOME');
  const [saves, setSaves] = useState<Record<string, SaveData | null>>({
    '1': null,
    '2': null,
    '3': null
  });
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  // Load saves on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSaves(parsed);
      } catch (e) {
        console.error("Failed to parse saves", e);
      }
    }
  }, []);

  const saveToStorage = (newSaves: Record<string, SaveData | null>) => {
    setSaves(newSaves);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
  };

  const handleNewGameClick = (slotId: string) => {
    setActiveSlot(slotId);
    setView('CREATE');
  };

  const handleLoadGame = (slotId: string) => {
    if (saves[slotId]) {
      setActiveSlot(slotId);
      setView('GAME');
    }
  };

  const handleDeleteGame = (slotId: string) => {
    const newSaves = { ...saves, [slotId]: null };
    saveToStorage(newSaves);
  };

  const handleCreateComplete = (name: string, background: string, initialStats: Partial<PlayerStats>) => {
    if (!activeSlot) return;

    const newSave: SaveData = {
      id: activeSlot,
      name,
      background,
      stats: { ...INITIAL_STATS, ...initialStats },
      potential: 0,
      isAwakened: false,
      logs: [{
        id: Date.now().toString(),
        timestamp: new Date(), // This will be serialized to string in JSON
        message: "Your journey begins in the mortal realm.",
        type: 'info'
      } as any],
      shards: [],
      scrolls: [],
      techniques: [],
      currency: 0,
      tutorialState: 'intro',
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      resources: { wood: 0, stone: 0, herbs: 0 },
      laborMastery: { 
        woodcutting: 1, mining: 1, gathering: 1,
        woodcuttingXp: 0, miningXp: 0, gatheringXp: 0 
      },
      stamina: 100,
      inventoryItems: [],
      merchant: {
        moodName: 'Neutral',
        moodMultiplier: 1.0,
        moodRarity: 'Common',
        lastUpdate: 0, // Will trigger update immediately in GameSession
        scrollsBought: 0,
        resourcePrices: { wood: 3, stone: 3, herbs: 3 } // Default starter prices
      },
      titles: ['mortal'],
      equippedTitle: 'mortal',
      destinyRerolls: 3
    };

    const newSaves = { ...saves, [activeSlot]: newSave };
    saveToStorage(newSaves);
    setView('GAME');
  };

  const handleGameSave = (data: SaveData) => {
    if (!activeSlot) return;
    const newSaves = { ...saves, [activeSlot]: data };
    saveToStorage(newSaves);
  };

  const handleExitGame = () => {
    setView('MENU');
    setActiveSlot(null);
  };

  return (
    <div className="text-slate-200 bg-slate-950 min-h-screen">
      {view === 'WELCOME' && (
        <WelcomeScreen onStart={() => setView('MENU')} />
      )}

      {view === 'MENU' && (
        <MainMenu 
          saves={saves} 
          onNewGame={handleNewGameClick} 
          onLoadGame={handleLoadGame} 
          onDeleteGame={handleDeleteGame} 
        />
      )}

      {view === 'CREATE' && (
        <CharacterCreation 
          onComplete={handleCreateComplete} 
          onCancel={() => { setView('MENU'); setActiveSlot(null); }} 
        />
      )}

      {view === 'GAME' && activeSlot && saves[activeSlot] && (
        <GameSession 
          saveData={saves[activeSlot]!} 
          onSave={handleGameSave} 
          onExit={handleExitGame} 
        />
      )}
    </div>
  );
};

export default App;