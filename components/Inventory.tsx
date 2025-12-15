import React from 'react';
import { Shard, GameMode, Resources, InventoryItem } from '../types';
import { Backpack, Hexagon, Coins, Axe, Pickaxe, Sprout, Gem, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface Props {
  shards: Shard[];
  currency: number;
  resources?: Resources;
  inventoryItems?: InventoryItem[];
  onSellItem?: (item: InventoryItem) => void;
}

export const Inventory: React.FC<Props> = ({ 
  shards, 
  currency, 
  resources = { wood: 0, stone: 0, herbs: 0 },
  inventoryItems = [],
  onSellItem
}) => {
  const getShardColor = (element: string) => {
    switch(element) {
      case 'Fire': return 'text-red-400 bg-red-900/20 border-red-500/50';
      case 'Water': return 'text-blue-400 bg-blue-900/20 border-blue-500/50';
      case 'Wood': return 'text-green-400 bg-green-900/20 border-green-500/50';
      case 'Metal': return 'text-slate-300 bg-slate-700/50 border-slate-500/50';
      case 'Earth': return 'text-orange-300 bg-orange-900/20 border-orange-500/50';
      case 'Lightning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getRarityColor = (rarity: string) => {
     switch(rarity) {
       case 'Legendary': return 'text-yellow-400 border-yellow-500';
       case 'Epic': return 'text-purple-400 border-purple-500';
       case 'Rare': return 'text-blue-400 border-blue-500';
       case 'Uncommon': return 'text-green-400 border-green-500';
       default: return 'text-slate-400 border-slate-600';
     }
  };

  return (
    <div className="animate-in fade-in space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-3xl font-fantasy text-slate-200 flex items-center gap-3">
             <Backpack className="w-8 h-8" /> Spatial Bag
           </h2>
           <p className="text-slate-500 mt-1">Storage for your gathered resources and mystical treasures.</p>
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-amber-500/30">
          <div className="text-xs text-slate-500 uppercase tracking-widest">Total Wealth</div>
          <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            {currency} <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Raw Resources */}
      <div>
        <h3 className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
           Raw Materials
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/20 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105">
            <Axe className="w-8 h-8 opacity-80 text-amber-600" />
            <div className="font-bold text-amber-200">Spirit Wood</div>
            <div className="text-sm opacity-70">x{Math.floor(resources.wood)}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105">
            <Pickaxe className="w-8 h-8 opacity-80 text-slate-400" />
            <div className="font-bold text-slate-300">Ore Stone</div>
            <div className="text-sm opacity-70">x{Math.floor(resources.stone)}</div>
          </div>
          <div className="p-4 rounded-xl border border-green-900/50 bg-green-950/20 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105">
            <Sprout className="w-8 h-8 opacity-80 text-green-500" />
            <div className="font-bold text-green-200">Medicinal Herbs</div>
            <div className="text-sm opacity-70">x{Math.floor(resources.herbs)}</div>
          </div>
        </div>
      </div>

      {/* Treasures / Loot */}
      <div>
         <h3 className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
           Treasures & Loot
        </h3>
        {inventoryItems.length === 0 ? (
           <p className="text-slate-600 italic text-sm">No treasures found yet. Explore the world to find loot.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {inventoryItems.map(item => (
               <div key={item.id} className={`p-4 rounded-xl border bg-slate-900/50 flex flex-col justify-between group ${getRarityColor(item.rarity)}`}>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-200">{item.name}</span>
                      <span className={`text-[10px] uppercase border px-1 rounded ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2 italic">"{item.description}"</div>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-slate-800 pt-2 mt-2">
                    <div className="text-sm text-slate-400">Qty: <span className="font-bold text-white">{item.quantity}</span></div>
                    <Button 
                      variant="secondary" 
                      className="text-xs h-7 px-2 hover:bg-amber-900/30 hover:text-amber-200 border-slate-700"
                      onClick={() => onSellItem && onSellItem(item)}
                    >
                      Sell ({item.value} <Coins size={10} className="ml-1"/>)
                    </Button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Shards */}
      <div>
        <h3 className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
           Elemental Shards
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shards.map((shard) => (
            <div 
              key={shard.id + shard.element} 
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 ${getShardColor(shard.element)}`}
            >
              <Hexagon className="w-8 h-8 opacity-80" />
              <div className="font-bold">{shard.element} Shard</div>
              <div className="text-sm opacity-70">x{shard.quantity}</div>
            </div>
          ))}
          
          {shards.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-600 italic border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center">
              No elemental shards found yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};