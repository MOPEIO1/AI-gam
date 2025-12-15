import React, { useState, useEffect } from 'react';
import { Scroll as ScrollIcon, Zap, Flame, Wind, Plus, Sparkles, BookOpen, Crown, Lock, ArrowUpCircle, Trash2, ShieldCheck, CheckCircle, Info, X } from 'lucide-react';
import { Scroll, Technique, Attribute, Rarity, ActiveBuff } from '../types';
import { Button } from './Button';
import { generateScrollFusion } from '../services/geminiService';
import { StatBar } from './StatBar';
import { SoundManager } from '../utils/SoundManager';

interface Props {
  inventory: Scroll[];
  techniques: Technique[];
  chiLevel: number;
  onTechniqueCreated: (tech: Technique) => void;
  tutorialActive?: boolean;
  tutorialStep?: string;
  onTutorialAction?: (action: string, data?: any) => void;
  onTrain?: (stat: Attribute, amount: number) => void;
  onSellScroll?: (id: string, price: number) => void;
  onSellTechnique?: (id: string) => void;
  onEquipTechnique?: (id: string) => void;
  onMasteryIncrease?: (id: string) => void;
  onActivateBuff?: (buff: ActiveBuff) => void;
}

interface FloatingEffect {
  id: number;
  x: number;
  y: number;
  content: React.ReactNode;
}

const RARITY_VALUE: Record<Rarity, number> = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 3,
  'Epic': 4,
  'Legendary': 5,
  'Mythic': 6
};

export const ScrollFusion: React.FC<Props> = ({ 
  inventory, 
  techniques, 
  chiLevel, 
  onTechniqueCreated,
  tutorialActive = false,
  tutorialStep = '',
  onTutorialAction,
  onTrain,
  onSellScroll,
  onSellTechnique,
  onEquipTechnique,
  onMasteryIncrease,
  onActivateBuff
}) => {
  const [selectedScrolls, setSelectedScrolls] = useState<Scroll[]>([]);
  const [isFusing, setIsFusing] = useState(false);
  const [fusionResult, setFusionResult] = useState<Technique | null>(null);
  const [practicing, setPracticing] = useState<string | null>(null);
  const [effects, setEffects] = useState<FloatingEffect[]>([]);
  const [showChart, setShowChart] = useState(false);
  
  // State for detailed view modal
  const [viewingTechnique, setViewingTechnique] = useState<Technique | null>(null);

  const maxSlots = chiLevel >= 20 ? 3 : 2;
  const SCROLL_LIMIT = 5;
  const ACTIVE_TECHNIQUE_LIMIT = 3;

  useEffect(() => {
    if (effects.length > 0) {
      const timer = setTimeout(() => {
        setEffects(prev => prev.slice(1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [effects]);

  // Auto-dismiss the fusion result toast after 10 seconds
  useEffect(() => {
    if (fusionResult) {
      const timer = setTimeout(() => {
        setFusionResult(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [fusionResult]);

  const addEffect = (e: React.MouseEvent<HTMLButtonElement>, content: React.ReactNode) => {
    setEffects(prev => [...prev, {
      id: Date.now(),
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      content
    }]);
  };

  const toggleScrollSelection = (scroll: Scroll) => {
    const isSelected = selectedScrolls.find(s => s.id === scroll.id);
    let newSelection = selectedScrolls;

    if (isSelected) {
      newSelection = selectedScrolls.filter(s => s.id !== scroll.id);
      setSelectedScrolls(newSelection);
    } else {
      if (selectedScrolls.length < maxSlots) {
        newSelection = [...selectedScrolls, scroll];
        setSelectedScrolls(newSelection);
        SoundManager.playClick();
      }
    }
    
    if (onTutorialAction) {
       onTutorialAction('selection_changed', { count: newSelection.length });
    }
  };

  const handleFusion = async () => {
    if (selectedScrolls.length < 2) return;
    
    if (tutorialActive && tutorialStep !== 'click_fuse') return;

    setIsFusing(true);
    setFusionResult(null);
    SoundManager.playFusionCharge();

    await new Promise(resolve => setTimeout(resolve, 2000));

    let totalRarityScore = 0;
    selectedScrolls.forEach(s => totalRarityScore += RARITY_VALUE[s.rarity]);
    const averageRarity = totalRarityScore / selectedScrolls.length;
    
    const rarityMultiplier = 1 + (averageRarity * 0.5); 
    
    const result = await generateScrollFusion(
      selectedScrolls.map(s => s.name),
      chiLevel
    );

    const derivedMaxMastery = Math.floor(100 * rarityMultiplier);
    const derivedDamageMult = (1.5 + (chiLevel * 0.05)) * (averageRarity * 0.8);

    const newTechnique: Technique = {
      id: Date.now().toString(),
      name: result.name,
      description: result.description,
      visualEffect: result.visual,
      components: selectedScrolls.map(s => s.name),
      mastery: 0,
      maxMastery: derivedMaxMastery,
      rank: result.rank,
      damageMultiplier: parseFloat(derivedDamageMult.toFixed(2)),
      synergy: result.synergy,
      ultimateEffect: result.ultimateEffect,
      equipped: false,
      rarity: averageRarity > 4.5 ? 'Legendary' : averageRarity > 3.5 ? 'Epic' : averageRarity > 2.5 ? 'Rare' : averageRarity > 1.5 ? 'Uncommon' : 'Common'
    };

    setFusionResult(newTechnique);
    onTechniqueCreated(newTechnique);
    setIsFusing(false);
    setSelectedScrolls([]);
    SoundManager.playFusionSuccess();
    
    selectedScrolls.forEach(s => {
       if (onSellScroll) onSellScroll(s.id, 0); 
    });

    if (tutorialActive && onTutorialAction) {
      onTutorialAction('fused');
    }
  };

  const handleCastScroll = async (scroll: Scroll, e: React.MouseEvent<HTMLButtonElement>) => {
    setPracticing(scroll.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    SoundManager.playSuccess();

    // 1. Stat Buff (Combat/Defense)
    if (scroll.type === 'Offensive' || scroll.type === 'Defensive') {
       if (onActivateBuff) {
          onActivateBuff({
             name: `${scroll.element} Resonance`,
             description: `Channeling the power of ${scroll.name} into your body.`,
             multiplier: 1.5,
             affectedStats: [scroll.requiredStat],
             expiresAt: Date.now() + 60000 // 1 minute
          });
          addEffect(e, <div className="text-amber-400 text-xs font-bold">Resonance Active</div>);
       }
    } 
    // 2. XP Gain (Utility/Movement)
    else {
       if (onTrain) {
          onTrain(scroll.requiredStat, 20); // Big boost
          addEffect(e, <div className="text-cyan-400 text-xs font-bold">+20 {scroll.requiredStat}</div>);
       }
    }

    setPracticing(null);
  };

  const handlePracticeTechnique = async (techName: string, id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setPracticing(id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Standard Practice
    if (onTrain) {
      if (Math.random() < 0.2) {
         onTrain(Attribute.Chi, 1);
         addEffect(e, <div className="text-cyan-400 text-xs font-bold">+1 Chi</div>);
      }
    }

    if (onMasteryIncrease) {
        onMasteryIncrease(id);
        addEffect(e, <div className="text-purple-400 text-xs font-bold">+5 Mastery</div>);
    }
    
    setPracticing(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in relative">
      
      {/* Detail Modal */}
      {viewingTechnique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-amber-500/50 p-6 rounded-xl w-full max-w-md text-center relative shadow-2xl">
              <button 
                 onClick={() => setViewingTechnique(null)}
                 className="absolute top-2 right-2 text-slate-400 hover:text-white"
              >
                 <X />
              </button>

              <div className="text-amber-300 font-fantasy text-sm mb-1 uppercase tracking-widest flex items-center justify-center gap-2">
                 <Crown className="w-4 h-4" /> Passive Technique
               </div>
               <h3 className="text-3xl font-bold text-white mb-2 glow-text">{viewingTechnique.name}</h3>
               
               <div className="flex justify-center gap-2 mb-4">
                 <div className="text-xs font-mono text-purple-300 border border-purple-500/30 px-2 py-1 rounded bg-purple-900/20">
                   Rank: {viewingTechnique.rank}
                 </div>
                 {viewingTechnique.rarity && (
                    <div className="text-xs font-mono text-yellow-300 border border-yellow-500/30 px-2 py-1 rounded bg-yellow-900/20">
                      Rarity: {viewingTechnique.rarity}
                    </div>
                 )}
               </div>

               <p className="text-slate-200 text-sm italic mb-4 leading-relaxed">"{viewingTechnique.description}"</p>
               
               <div className="bg-slate-900/50 rounded-lg p-3 text-left space-y-2 text-xs">
                 <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300"><span className="text-cyan-400 font-semibold">Visual:</span> {viewingTechnique.visualEffect}</span>
                 </div>
                 <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300"><span className="text-orange-400 font-semibold">Effect:</span> {viewingTechnique.synergy || "Passive Chi enhancement"}</span>
                 </div>
                 <div className="flex items-start gap-2">
                    <ArrowUpCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300"><span className="text-green-400 font-semibold">Ultimate:</span> {viewingTechnique.ultimateEffect || "Unlock at Max Mastery"}</span>
                 </div>
               </div>

               <div className="mt-6 flex justify-center">
                  <Button onClick={() => setViewingTechnique(null)} variant="secondary" className="w-full">
                     Close Tome
                  </Button>
               </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center relative">
        <h2 className="text-3xl font-fantasy text-cyan-100 mb-2">Scroll Synthesis</h2>
        <p className="text-slate-400">Combine <span className="text-amber-400">Active Scrolls</span> to forge powerful <span className="text-purple-400">Passive Techniques</span>. <br/><span className="text-xs text-slate-500">Higher rarity scrolls yield stronger techniques.</span></p>
        <button 
          onClick={() => setShowChart(!showChart)}
          className="absolute right-0 top-0 text-xs flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors bg-slate-800 px-3 py-1 rounded-full border border-slate-700"
        >
          <Info size={14} /> View Ranks
        </button>
      </div>

      {showChart && (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mb-4 text-sm animate-in slide-in-from-top-2">
           <div className="grid grid-cols-2 gap-8">
             <div>
               <h4 className="font-bold text-slate-200 mb-2 border-b border-slate-700 pb-1">Scroll Rarity</h4>
               <ul className="space-y-1">
                 <li className="text-slate-400"><span className="text-slate-500 font-bold">Common:</span> Basic elemental attacks.</li>
                 <li className="text-green-400"><span className="text-green-500 font-bold">Uncommon:</span> Refined techniques.</li>
                 <li className="text-blue-400"><span className="text-blue-500 font-bold">Rare:</span> Potent abilities.</li>
                 <li className="text-purple-400"><span className="text-purple-500 font-bold">Epic:</span> Feared destructive power.</li>
                 <li className="text-yellow-400"><span className="text-yellow-500 font-bold">Legendary:</span> World-shaking arts.</li>
               </ul>
             </div>
             <div>
               <h4 className="font-bold text-slate-200 mb-2 border-b border-slate-700 pb-1">Tome Ranks</h4>
               <ul className="space-y-1">
                 <li className="text-slate-400"><span className="font-bold">Mortal Rank:</span> Simple combinations.</li>
                 <li className="text-orange-400"><span className="font-bold">Earth Rank:</span> Solid foundations.</li>
                 <li className="text-cyan-400"><span className="font-bold">Heaven Rank:</span> Advanced cultivation.</li>
                 <li className="text-yellow-400"><span className="font-bold">Divine Rank:</span> Near-immortal perfection.</li>
               </ul>
             </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inventory Column */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 h-fit">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
              <ScrollIcon className="w-4 h-4" /> Active Components
             </h3>
             <span className={`text-xs font-mono px-2 py-0.5 rounded ${inventory.length >= SCROLL_LIMIT ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
               {inventory.length}/{SCROLL_LIMIT}
             </span>
          </div>

          <div className="space-y-3">
            {inventory.length === 0 && <p className="text-slate-500 italic text-sm">No scrolls found. Visit the Market.</p>}
            {inventory.map(scroll => {
              const isSelected = selectedScrolls.some(s => s.id === scroll.id);
              const shouldHighlight = tutorialActive && !isSelected && selectedScrolls.length < 2 && tutorialStep !== 'click_fuse';
              
              return (
                <div 
                  key={scroll.id}
                  className={`p-3 rounded-lg border transition-all flex flex-col gap-2 relative group
                    ${isSelected 
                      ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                      : 'bg-slate-800 border-slate-700'}
                    ${shouldHighlight ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''}
                    `}
                >
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleScrollSelection(scroll)}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded bg-slate-900 ${scroll.element === 'Fire' ? 'text-red-400' : 'text-blue-400'}`}>
                        {scroll.element === 'Fire' ? <Flame className="w-4 h-4" /> : <Wind className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-200 text-sm">{scroll.name}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 uppercase">{scroll.rarity}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />}
                  </div>
                  
                  <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                     <button 
                       className="text-slate-600 hover:text-red-400 transition-colors p-1"
                       title="Sell/Discard (25% refund)"
                       onClick={(e) => {
                         e.stopPropagation();
                         if(confirm(`Discard ${scroll.name} for ${Math.floor(scroll.price * 0.25)} coins?`)) {
                           if(onSellScroll) onSellScroll(scroll.id, scroll.price);
                         }
                       }}
                     >
                       <Trash2 size={14} />
                     </button>

                     <Button 
                       variant="secondary" 
                       className="text-xs h-6 py-0 px-2 text-cyan-400 hover:text-cyan-300 relative overflow-visible"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleCastScroll(scroll, e);
                       }}
                       disabled={practicing !== null}
                     >
                        {practicing === scroll.id ? 'Casting...' : 'Cast'}
                        {practicing === scroll.id && <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />}
                     </Button>
                  </div>
                  {effects.map(effect => (
                    <div 
                        key={effect.id}
                        className="absolute pointer-events-none animate-[floatUp_2s_ease-out_forwards] z-50"
                        style={{ left: effect.x, top: effect.y - 40 }}
                    >
                        {effect.content}
                    </div>
                   ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fusion Area */}
        <div className="flex flex-col items-center justify-start space-y-6 pt-8">
          <div className="relative">
            {/* Spinning/Pulsing effects for fusion */}
            <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 ${isFusing ? 'bg-cyan-500/40 animate-[spin_1s_linear_infinite]' : 'bg-transparent'}`} />
            
            <div className="flex gap-4 items-center">
              {Array.from({ length: maxSlots }).map((_, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={`w-20 h-28 md:w-24 md:h-32 border-2 border-dashed rounded-lg flex items-center justify-center p-2 text-center text-xs relative transition-all
                    ${selectedScrolls[idx] ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-700 bg-slate-800/50'}`}>
                    {selectedScrolls[idx] ? (
                      <div className="animate-in zoom-in font-bold text-cyan-200">{selectedScrolls[idx].name}</div>
                    ) : (
                      <span className="text-slate-600">Slot {idx + 1}</span>
                    )}
                  </div>
                  {idx < maxSlots - 1 && <Plus className={`w-6 h-6 md:w-8 md:h-8 text-slate-600 mx-2 ${isFusing ? 'animate-spin text-cyan-400' : ''}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className={tutorialStep === 'click_fuse' ? 'relative z-20' : ''}>
             {tutorialStep === 'click_fuse' && (
               <div className="absolute -inset-2 bg-amber-500/20 blur-lg rounded-xl animate-pulse -z-10" />
             )}
             <Button 
              onClick={handleFusion}
              disabled={selectedScrolls.length < 2 || isFusing}
              isLoading={isFusing}
              className={`w-48 py-4 text-lg font-fantasy shadow-cyan-900/50 
                ${tutorialStep === 'click_fuse' ? 'ring-2 ring-amber-400' : ''}`}
            >
              {isFusing ? 'Refining Chi...' : 'Fuse Scrolls'}
            </Button>
          </div>

          {/* New Technique Toast (Auto-dismissing) */}
          {fusionResult && (
             <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-900 to-purple-900 border border-amber-500 p-4 rounded-xl w-80 text-center animate-in slide-in-from-bottom-5 duration-500 shadow-2xl z-50">
               <button 
                  onClick={() => setFusionResult(null)}
                  className="absolute top-1 right-2 text-slate-400 hover:text-white"
               >
                 <X size={14} />
               </button>
               <div className="text-amber-300 font-fantasy text-xs mb-1 uppercase tracking-widest flex items-center justify-center gap-2">
                 <Crown className="w-3 h-3" /> Fusion Success!
               </div>
               <h3 className="text-xl font-bold text-white mb-1 glow-text">{fusionResult.name}</h3>
               <div className="text-xs text-slate-300 mb-2">{fusionResult.rank} Rank &bull; {fusionResult.rarity}</div>
               <p className="text-xs text-purple-200 italic">Added to Mastery Tome</p>
               <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 animate-[width_10s_linear] w-full origin-left" />
               </div>
             </div>
          )}
        </div>

        {/* Known Techniques */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 h-fit">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Passive Arts
            </h3>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${techniques.filter(t => t.equipped).length >= ACTIVE_TECHNIQUE_LIMIT ? 'bg-amber-900/50 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              Equipped: {techniques.filter(t => t.equipped).length}/{ACTIVE_TECHNIQUE_LIMIT}
            </span>
          </div>
          
          {techniques.length === 0 ? (
            <div className="text-center text-slate-600 py-8 italic">No techniques mastered yet.</div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {techniques.map(tech => (
                <div 
                   key={tech.id} 
                   className={`bg-slate-800 p-4 rounded-lg border transition-all group relative cursor-pointer
                     ${tech.equipped ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-700 hover:border-cyan-500/30'}`}
                   onClick={() => setViewingTechnique(tech)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold transition-colors ${tech.equipped ? 'text-amber-200' : 'text-cyan-100'}`}>{tech.name}</h4>
                      <div className="flex gap-2 mt-1">
                         <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-wider">{tech.rank}</span>
                         {tech.rarity && <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-yellow-500 uppercase tracking-wider border border-yellow-900/30">{tech.rarity}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="my-3">
                    <StatBar 
                      label="Mastery" 
                      value={tech.mastery} 
                      max={tech.maxMastery} 
                      color={tech.equipped ? "bg-amber-500" : "bg-purple-500"}
                      icon={<Sparkles className="w-3 h-3" />}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                      <div className="flex gap-2">
                         <button 
                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            title="Disperse (Delete)"
                            onClick={(e) => {
                              e.stopPropagation();
                              if(confirm(`Disperse ${tech.name}? This cannot be undone.`)) {
                                if(onSellTechnique) onSellTechnique(tech.id);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <button 
                            className={`p-1 transition-colors ${tech.equipped ? 'text-amber-500' : 'text-slate-500 hover:text-amber-300'}`}
                            title={tech.equipped ? "Unequip" : "Equip"}
                            onClick={(e) => {
                               e.stopPropagation();
                               onEquipTechnique && onEquipTechnique(tech.id);
                            }}
                          >
                            <ShieldCheck size={14} />
                          </button>
                      </div>

                      <Button 
                       variant="secondary" 
                       className="text-xs h-8"
                       onClick={(e) => {
                          e.stopPropagation();
                          handlePracticeTechnique(tech.name, tech.id, e);
                       }}
                       disabled={practicing !== null}
                      >
                         Practice
                      </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
       <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
        }
        @keyframes width {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
};