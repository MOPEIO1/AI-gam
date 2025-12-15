import React, { useState, useEffect } from 'react';
import { ShoppingBag, Coins, Clock, Lock, ArrowLeftRight, TrendingUp, TrendingDown, Store, Scale } from 'lucide-react';
import { Scroll, Rarity, MerchantState, Resources, TutorialState } from '../types';
import { Button } from './Button';
import { MASTER_SCROLL_LIST } from '../data/scrolls';
import { SoundManager } from '../utils/SoundManager';

interface Props {
  currency: number;
  onBuy: (scroll: Scroll, price: number) => void;
  playerLevel: number;
  tutorialActive?: boolean;
  inventoryCount?: number;
  merchantState?: MerchantState;
  resources?: Resources;
  setResources?: (r: Resources) => void;
  onEarnCurrency?: (amount: number) => void;
  tutorialStep?: TutorialState;
  setTutorialStep?: (s: TutorialState) => void;
  ownedScrolls?: Scroll[]; 
}

export const Market: React.FC<Props> = ({ 
  currency, 
  onBuy, 
  playerLevel, 
  tutorialActive = false, 
  inventoryCount = 0,
  merchantState,
  resources = { wood: 0, stone: 0, herbs: 0 },
  setResources,
  onEarnCurrency,
  tutorialStep,
  setTutorialStep,
  ownedScrolls = []
}) => {
  const [shopInventory, setShopInventory] = useState<Omit<Scroll, 'id' | 'mastery' | 'requiredLevel'>[]>([]);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const SCROLL_LIMIT = 5;
  const DAILY_BUY_LIMIT = 2;

  const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Helper to get random items
  const getRandomStock = () => {
    const newStock: Omit<Scroll, 'id' | 'mastery' | 'requiredLevel'>[] = [];
    const stockSize = 6;

    for (let i = 0; i < stockSize; i++) {
      const roll = Math.random();
      let selectedRarity: Rarity = 'Common';
      
      if (roll > 0.99) selectedRarity = 'Legendary';
      else if (roll > 0.95) selectedRarity = 'Epic';
      else if (roll > 0.85) selectedRarity = 'Rare';
      else if (roll > 0.60) selectedRarity = 'Uncommon';

      const pool = MASTER_SCROLL_LIST.filter(s => s.rarity === selectedRarity);
      if (pool.length > 0) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        newStock.push(item);
      }
    }
    return newStock;
  };

  // Timer Update
  useEffect(() => {
    const updateTimer = () => {
        if (!merchantState) return;
        const now = Date.now();
        const nextRefresh = merchantState.lastUpdate + REFRESH_INTERVAL_MS;
        const diff = nextRefresh - now;

        if (diff <= 0) {
            setTimeRemaining("Leaving soon...");
        } else {
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        }
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer(); // Init
    return () => clearInterval(timer);
  }, [merchantState]);

  useEffect(() => {
    const savedStock = localStorage.getItem('market_stock');
    const lastRefreshTime = localStorage.getItem('market_last_refresh');
    const now = Date.now();

    if (savedStock && lastRefreshTime) {
      const timeDiff = now - parseInt(lastRefreshTime);
      if (timeDiff < REFRESH_INTERVAL_MS) {
        setShopInventory(JSON.parse(savedStock));
      } else {
        const newStock = getRandomStock();
        setShopInventory(newStock);
        localStorage.setItem('market_stock', JSON.stringify(newStock));
        localStorage.setItem('market_last_refresh', now.toString());
      }
    } else {
      const newStock = getRandomStock();
      setShopInventory(newStock);
      localStorage.setItem('market_stock', JSON.stringify(newStock));
      localStorage.setItem('market_last_refresh', now.toString());
    }
  }, []);

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400 border-yellow-500 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
      case 'Epic': return 'text-purple-400 border-purple-500 bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'Rare': return 'text-blue-400 border-blue-500 bg-blue-900/20';
      case 'Uncommon': return 'text-green-400 border-green-500 bg-green-900/20';
      default: return 'text-slate-400 border-slate-600 bg-slate-800';
    }
  };

  // Selling Logic
  const handleSellResource = (type: keyof Resources, sellPrice: number) => {
    if (!resources || !setResources || !onEarnCurrency || !merchantState) return;
    
    // Only sell integer amounts
    const amount = Math.floor(resources[type]);
    if (amount < 1) return;

    const totalValue = Math.floor(sellPrice * amount);

    const newResources = { ...resources, [type]: resources[type] - amount };
    setResources(newResources);
    onEarnCurrency(totalValue);
    SoundManager.playClick(); // Coin sound

    if (tutorialStep === 'work_labor' && totalValue > 0 && setTutorialStep) {
        setTutorialStep('open_market'); // Advance tutorial
    }
    if (tutorialStep === 'open_market' && setTutorialStep && (currency + totalValue) >= 90) {
        setTutorialStep('visit_market');
    }
  };

  const getMerchantAvatarSeed = (mood: string) => {
    if (mood.includes("Angry") || mood.includes("Aggressive")) return "AngryMerchant";
    if (mood.includes("Happy") || mood.includes("Joyful")) return "HappyMerchant";
    if (mood.includes("Sad") || mood.includes("Melancholic")) return "SadMerchant";
    if (mood.includes("Suspenseful") || mood.includes("Tense")) return "SuspiciousMerchant";
    return "NeutralMerchant" + mood.length; // Variance
  };

  const scrollsBought = merchantState?.scrollsBought || 0;
  const canBuyMore = scrollsBought < DAILY_BUY_LIMIT;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-fantasy text-amber-200 flex items-center gap-3">
            <Store className="w-8 h-8" /> Spirit Market
          </h2>
          <p className="text-slate-400 mt-1">Trade your labor for gold, or gold for power.</p>
        </div>
        
        <div className={`flex items-center gap-4 bg-slate-900 p-4 rounded-xl border ${tutorialActive ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-amber-500/30'}`}>
            <div className="text-right">
               <div className="text-xs text-slate-500 uppercase tracking-widest">Wealth</div>
               <div className="text-xl font-bold text-amber-400 flex items-center justify-end gap-2">
                 {currency} <Coins className="w-5 h-5" />
               </div>
            </div>
        </div>
      </div>

      {/* Merchant Interaction Header */}
      {merchantState && (
        <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl relative overflow-hidden flex items-center gap-6">
            <div className={`absolute top-0 left-0 w-1 h-full ${merchantState.moodMultiplier > 1 ? 'bg-green-500' : 'bg-red-500'}`} />
            
            {/* Merchant Face */}
            <div className="flex-shrink-0">
               <div className="w-20 h-20 rounded-full border-2 border-slate-600 bg-slate-800 overflow-hidden relative">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getMerchantAvatarSeed(merchantState.moodName)}&backgroundColor=b6e3f4`}
                    alt="Merchant"
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Merchant's Mood</div>
                    <div className="text-xs text-amber-500 flex items-center gap-1 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-700">
                        <Clock size={12} /> {timeRemaining}
                    </div>
                </div>
                
                <h3 className="text-2xl font-fantasy text-slate-200">{merchantState.moodName}</h3>
                
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs border ${merchantState.moodMultiplier >= 1 ? 'bg-green-900/30 text-green-400 border-green-500/50' : 'bg-red-900/30 text-red-400 border-red-500/50'}`}>
                        Price Modifier: x{merchantState.moodMultiplier.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-600 border border-slate-700 px-2 py-0.5 rounded">{merchantState.moodRarity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${canBuyMore ? 'text-cyan-400 border-cyan-500/30' : 'text-red-400 border-red-500/30'}`}>
                       Limit: {scrollsBought}/{DAILY_BUY_LIMIT}
                    </span>
                </div>
            </div>
            <div className="hidden md:block">
               {merchantState.moodMultiplier >= 1.2 ? <TrendingUp className="text-green-500 w-10 h-10" /> : merchantState.moodMultiplier <= 0.8 ? <TrendingDown className="text-red-500 w-10 h-10" /> : <ArrowLeftRight className="text-slate-500 w-10 h-10" />}
            </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4">
        <button 
          onClick={() => { SoundManager.playClick(); setActiveTab('buy'); }}
          className={`flex-1 py-3 rounded-lg border font-fantasy tracking-wider transition-all ${activeTab === 'buy' ? 'bg-amber-900/40 border-amber-500 text-amber-100' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
        >
          <div className="flex items-center justify-center gap-2">
             <ShoppingBag size={18} /> Buy Scrolls
          </div>
        </button>
        <button 
          onClick={() => { SoundManager.playClick(); setActiveTab('sell'); }}
          className={`flex-1 py-3 rounded-lg border font-fantasy tracking-wider transition-all ${activeTab === 'sell' ? 'bg-cyan-900/40 border-cyan-500 text-cyan-100' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
        >
          <div className="flex items-center justify-center gap-2">
             <Scale size={18} /> Merchant Exchange
          </div>
        </button>
      </div>

      {/* BUY TAB */}
      {activeTab === 'buy' && (
        <div className="animate-in slide-in-from-left-4">
            {inventoryCount >= SCROLL_LIMIT && (
                <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg text-center text-red-200 text-sm mb-4">
                Your Scroll Bag is full ({inventoryCount}/{SCROLL_LIMIT}).
                </div>
            )}
            {!canBuyMore && (
                <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg text-center text-red-200 text-sm mb-4">
                Merchant limit reached. Come back tomorrow.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopInventory.map((item, idx) => {
                  const alreadyOwned = ownedScrolls.some(s => s.name === item.name);
                  const isFull = inventoryCount >= SCROLL_LIMIT;
                  const canAfford = currency >= item.price;
                  const buyable = !alreadyOwned && !isFull && canAfford && canBuyMore;

                  return (
                    <div key={idx} className={`p-5 rounded-xl border transition-all hover:scale-[1.02] ${getRarityColor(item.rarity)} relative group flex flex-col justify-between`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 border border-current px-1 rounded">{item.rarity}</span>
                                <span className="text-xs text-slate-500">{item.type}</span>
                            </div>
                            
                            <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                            <p className="text-xs opacity-70 mb-4">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 border-t border-slate-700/50 pt-3">
                        <div className="text-amber-400 font-bold flex items-center gap-1">
                            {item.price} <Coins className="w-3 h-3" />
                        </div>
                        <Button 
                            onClick={() => {
                                onBuy({ ...item, id: Date.now().toString() + idx, mastery: 0, requiredLevel: 1 }, item.price);
                            }}
                            disabled={!buyable}
                            className={`text-xs px-3 py-1 h-8 ${!buyable ? 'opacity-50' : 'hover:scale-105'}`}
                        >
                            {alreadyOwned ? 'Owned' : isFull ? 'Bag Full' : !canBuyMore ? 'Sold Out' : currency < item.price ? 'Too Poor' : 'Buy'}
                        </Button>
                        </div>
                    </div>
                  );
                })}
            </div>
        </div>
      )}

      {/* SELL TAB */}
      {activeTab === 'sell' && merchantState && (
        <div className="animate-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: 'wood', name: 'Spirit Wood', qty: resources?.wood || 0, price: merchantState.resourcePrices?.wood || 5 },
                    { id: 'stone', name: 'Ore Stone', qty: resources?.stone || 0, price: merchantState.resourcePrices?.stone || 5 },
                    { id: 'herbs', name: 'Medicinal Herbs', qty: resources?.herbs || 0, price: merchantState.resourcePrices?.herbs || 5 }
                ].map((res) => {
                    const integerQty = Math.floor(res.qty);
                    const totalValue = Math.floor(res.price * integerQty);
                    const isHighPrice = res.price >= 8;
                    const isLowPrice = res.price <= 3;
                    
                    return (
                        <div key={res.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-slate-300">{res.name}</h4>
                                <div className="text-sm text-slate-500">In Stock: <span className="text-white font-mono">{integerQty}</span></div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs text-slate-500">Today's Price</span>
                                    <span className={`text-sm font-bold flex items-center gap-1 ${isHighPrice ? 'text-green-400' : isLowPrice ? 'text-red-400' : 'text-slate-300'}`}>
                                        {res.price} <Coins size={12} className="inline"/>
                                        {isHighPrice && <TrendingUp size={12} />}
                                        {isLowPrice && <TrendingDown size={12} />}
                                    </span>
                                </div>
                                <Button 
                                    onClick={() => handleSellResource(res.id as any, res.price)}
                                    disabled={integerQty < 1}
                                    className="w-full"
                                    variant="secondary"
                                >
                                    Sell All ({totalValue})
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};