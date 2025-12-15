import React, { useRef, useEffect, useState } from 'react';
import { PlayerStats, Attribute, Scroll, InventoryItem, ItemType, Rarity, Technique } from '../types';
import { X, Heart, Zap, Shield, Crosshair } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

interface Props {
  stats: PlayerStats;
  biome: string;
  difficulty: number;
  equippedScrolls: Scroll[];
  passiveTechniques: Technique[];
  onExit: (loot: InventoryItem[], xp: number) => void;
  onDeath: () => void;
  avatarUrl: string;
}

// --- GAME CONSTANTS ---
const FPS = 60;
const TILE_SIZE = 40;
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1500;

interface Entity {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  hp: number;
  maxHp: number;
  dead: boolean;
}

interface Player extends Entity {
  speed: number;
  angle: number;
  cooldowns: Record<string, number>; // Scroll ID -> Timestamp
  shield: number;
  dashCharge: number;
}

interface Enemy extends Entity {
  type: 'chaser' | 'shooter' | 'boss';
  damage: number;
  xpValue: number;
  speed: number;
  attackTimer: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  radius: number;
  life: number;
  source: 'player' | 'enemy';
  pierce: number;
  effect?: 'burn' | 'slow' | 'knockback';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Drop {
  id: number;
  x: number;
  y: number;
  item: InventoryItem;
  life: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export const DungeonCrawler: React.FC<Props> = ({ 
  stats, 
  biome, 
  difficulty, 
  equippedScrolls, 
  passiveTechniques,
  onExit, 
  onDeath,
  avatarUrl 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  
  // Game State Refs (Mutable for Performance)
  const gameState = useRef({
    keys: {} as Record<string, boolean>,
    mouse: { x: 0, y: 0 },
    player: null as Player | null,
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    drops: [] as Drop[],
    texts: [] as FloatingText[],
    camera: { x: 0, y: 0 },
    lootBag: [] as InventoryItem[],
    totalXp: 0,
    startTime: Date.now(),
    lastFrame: Date.now(),
    spawnTimer: 0
  });

  const playerImageRef = useRef<HTMLImageElement | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const img = new Image();
    img.src = avatarUrl;
    playerImageRef.current = img;

    // Calculate Base Stats based on RPG Stats
    const baseHp = 100 + (stats[Attribute.Endurance] * 10);
    const baseSpeed = 4 + (stats[Attribute.Agility] * 0.1);
    const baseDmg = 10 + (stats[Attribute.Strength] * 2); // Used for basic attacks

    setMaxHp(baseHp);
    setHp(baseHp);

    gameState.current.player = {
      id: 0,
      x: MAP_WIDTH / 2,
      y: MAP_HEIGHT / 2,
      radius: 20,
      color: '#fff',
      hp: baseHp,
      maxHp: baseHp,
      dead: false,
      speed: baseSpeed,
      angle: 0,
      cooldowns: {},
      shield: 0,
      dashCharge: 100
    };

    // Apply Passive Technique Bonuses
    passiveTechniques.forEach(tech => {
       if (tech.equipped) {
          if (tech.name.includes("Iron")) gameState.current.player!.maxHp *= 1.2;
          if (tech.name.includes("Wind")) gameState.current.player!.speed *= 1.1;
       }
    });
    // Sync HP
    setHp(gameState.current.player!.hp); 
    setMaxHp(gameState.current.player!.maxHp);

    const handleKeyDown = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = false; };
    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            gameState.current.mouse.x = e.clientX - rect.left;
            gameState.current.mouse.y = e.clientY - rect.top;
        }
    };
    const handleMouseDown = () => {
        if (!gameState.current.player?.dead) shootBasicAttack();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let animationId: number;
    
    const loop = () => {
        if (!gameActive) return;
        const now = Date.now();
        const dt = (now - gameState.current.lastFrame) / 1000;
        gameState.current.lastFrame = now;

        update(dt);
        draw();

        animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        cancelAnimationFrame(animationId);
    };
  }, [gameActive]);

  // --- GAME LOGIC ---

  const update = (dt: number) => {
    const state = gameState.current;
    const player = state.player;
    if (!player || player.dead) return;

    // 1. Player Movement
    let dx = 0; 
    let dy = 0;
    if (state.keys['w'] || state.keys['arrowup']) dy -= 1;
    if (state.keys['s'] || state.keys['arrowdown']) dy += 1;
    if (state.keys['a'] || state.keys['arrowleft']) dx -= 1;
    if (state.keys['d'] || state.keys['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx*dx + dy*dy);
        player.x += (dx / length) * player.speed;
        player.y += (dy / length) * player.speed;
    }

    // Clamp Map
    player.x = Math.max(player.radius, Math.min(MAP_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(MAP_HEIGHT - player.radius, player.y));

    // Player Rotation (Look at mouse)
    const screenX = player.x - state.camera.x;
    const screenY = player.y - state.camera.y;
    player.angle = Math.atan2(state.mouse.y - screenY, state.mouse.x - screenX);

    // 2. Abilities (Hotkeys 1-4)
    equippedScrolls.forEach((scroll, idx) => {
        const key = (idx + 1).toString();
        if (state.keys[key]) {
            useAbility(scroll, idx);
        }
    });

    // 3. Camera Follow
    const canvas = canvasRef.current;
    if (canvas) {
        state.camera.x = player.x - canvas.width / 2;
        state.camera.y = player.y - canvas.height / 2;
    }

    // 4. Spawning Enemies
    state.spawnTimer += dt;
    // Difficulty scaler
    const spawnRate = Math.max(0.5, 3.0 - (difficulty * 0.2) - (score * 0.01)); 
    if (state.spawnTimer > spawnRate && state.enemies.length < 50) {
        spawnEnemy();
        state.spawnTimer = 0;
    }

    // 5. Update Enemies
    state.enemies.forEach(enemy => {
        // Move towards player
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;

        // Collision with Player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < player.radius + enemy.radius) {
            enemy.attackTimer -= dt;
            if (enemy.attackTimer <= 0) {
                takeDamage(enemy.damage);
                enemy.attackTimer = 1.0; // 1s attack speed
            }
        }
    });

    // 6. Projectiles
    state.projectiles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        
        // Particle trail
        if (Math.random() < 0.3) {
            spawnParticle(p.x, p.y, p.color, 2);
        }
    });
    state.projectiles = state.projectiles.filter(p => p.life > 0);

    // 7. Collision: Projectile vs Enemy
    state.projectiles.forEach(p => {
        if (p.source === 'player') {
            state.enemies.forEach(e => {
                if (e.dead) return;
                const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < e.radius + p.radius) {
                    // Hit
                    e.hp -= p.damage;
                    spawnFloatingText(e.x, e.y, Math.floor(p.damage).toString(), '#fff');
                    spawnParticle(e.x, e.y, p.color, 5);
                    if (p.pierce <= 0) p.life = 0;
                    else p.pierce--;

                    if (p.effect === 'knockback') {
                        const angle = Math.atan2(e.y - p.y, e.x - p.x);
                        e.x += Math.cos(angle) * 20;
                        e.y += Math.sin(angle) * 20;
                    }

                    if (e.hp <= 0) {
                        e.dead = true;
                        killEnemy(e);
                    }
                }
            });
        }
    });

    state.enemies = state.enemies.filter(e => !e.dead);

    // 8. Drops
    state.drops.forEach(d => {
        const dist = Math.hypot(player.x - d.x, player.y - d.y);
        // Magnet effect
        if (dist < 100) {
            d.x += (player.x - d.x) * 0.1;
            d.y += (player.y - d.y) * 0.1;
        }
        if (dist < player.radius + 10) {
            collectDrop(d);
            d.life = 0;
        }
    });
    state.drops = state.drops.filter(d => d.life > 0);

    // 9. Particles / Text cleanup
    state.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= dt; });
    state.particles = state.particles.filter(p => p.life > 0);
    
    state.texts.forEach(t => { t.y -= 0.5; t.life -= dt; });
    state.texts = state.texts.filter(t => t.life > 0);

    // Sync React State occasionally for UI
    if (Math.random() < 0.1) {
        setHp(player.hp);
        // Regenerate shield/dash
        player.shield = Math.min(100, player.shield + 0.1);
        player.dashCharge = Math.min(100, player.dashCharge + 0.5);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = gameState.current;
    const player = state.player;
    if (!player) return;

    // Clear
    ctx.fillStyle = '#0f172a'; // Dark slate
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);

    // Draw Map Grid (Floor)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let x = 0; x <= MAP_WIDTH; x += TILE_SIZE * 2) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= MAP_HEIGHT; y += TILE_SIZE * 2) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_WIDTH, y); ctx.stroke();
    }
    // Draw Bounds
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Drops
    state.drops.forEach(d => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(d.x, d.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Enemies
    state.enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = e.color;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        
        // HP Bar
        const hpPct = e.hp / e.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(e.x - 10, e.y - e.radius - 5, 20, 3);
        ctx.fillStyle = 'green';
        ctx.fillRect(e.x - 10, e.y - e.radius - 5, 20 * hpPct, 3);
    });

    // Projectiles
    state.projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle + Math.PI / 2); // Adjust for image orientation
    
    // Shield Visual
    if (player.shield > 0) {
        ctx.strokeStyle = `rgba(100, 200, 255, ${player.shield/100})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2); ctx.stroke();
    }

    if (playerImageRef.current && playerImageRef.current.complete) {
        ctx.drawImage(playerImageRef.current, -player.radius, -player.radius, player.radius * 2, player.radius * 2);
    } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // Floating Text
    state.texts.forEach(t => {
        ctx.globalAlpha = t.life;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(t.text, t.x, t.y);
        ctx.globalAlpha = 1;
    });

    ctx.restore();
  };

  // --- ACTIONS ---

  const spawnEnemy = () => {
    const player = gameState.current.player!;
    // Spawn away from player
    let x, y, dist;
    do {
        x = Math.random() * MAP_WIDTH;
        y = Math.random() * MAP_HEIGHT;
        dist = Math.hypot(player.x - x, player.y - y);
    } while (dist < 400);

    const typeRoll = Math.random();
    let type: Enemy['type'] = 'chaser';
    let color = '#ef4444'; // Red
    let speed = 2 + (difficulty * 0.2);
    let hp = 30 + (difficulty * 5);
    let radius = 15;

    if (typeRoll > 0.8) {
        type = 'shooter';
        color = '#a855f7'; // Purple
        speed *= 0.7;
        hp *= 0.8;
    } else if (score > 10 && Math.random() < 0.05) {
        type = 'boss';
        color = '#eab308'; // Gold
        radius = 40;
        hp *= 5;
        speed *= 0.5;
    }

    gameState.current.enemies.push({
        id: Date.now() + Math.random(),
        x, y, type, color, hp, maxHp: hp, radius, speed,
        damage: 5 + difficulty, xpValue: type === 'boss' ? 50 : 5, dead: false, attackTimer: 0
    });
  };

  const killEnemy = (e: Enemy) => {
    setScore(s => s + 1);
    gameState.current.totalXp += e.xpValue;
    spawnParticle(e.x, e.y, e.color, 10);
    spawnFloatingText(e.x, e.y, `+${e.xpValue} XP`, '#fbbf24');
    SoundManager.playMine(0.5); // Thud sound

    // Loot Drop Chance
    if (Math.random() < 0.3) {
        const items = ['Spirit Stone', 'Monster Core', 'Old Coin'];
        const itemName = items[Math.floor(Math.random() * items.length)];
        gameState.current.drops.push({
            id: Date.now(),
            x: e.x,
            y: e.y,
            life: 30, // seconds
            item: {
                id: Date.now().toString(),
                name: itemName,
                description: 'Loot from the dungeon.',
                quantity: 1,
                value: 5,
                type: ItemType.Resource,
                rarity: 'Common'
            }
        });
    }
  };

  const collectDrop = (d: Drop) => {
      gameState.current.lootBag.push(d.item);
      spawnFloatingText(gameState.current.player!.x, gameState.current.player!.y - 20, `Got ${d.item.name}!`, '#4ade80');
      SoundManager.playClick();
  };

  const shootBasicAttack = () => {
      const state = gameState.current;
      if (state.player!.cooldowns['basic'] && Date.now() < state.player!.cooldowns['basic']) return;
      
      const dmg = 10 + (stats[Attribute.Strength] || 0) + (stats[Attribute.Chi] || 0);
      spawnProjectile(state.player!.x, state.player!.y, state.player!.angle, 10, dmg, '#22d3ee', 'player', 0);
      SoundManager.playChop(2); // High pitch swipe
      state.player!.cooldowns['basic'] = Date.now() + 300; // 300ms attack speed
  };

  const useAbility = (scroll: Scroll, idx: number) => {
      const state = gameState.current;
      const player = state.player!;
      const cdKey = `scroll_${idx}`;
      
      if (player.cooldowns[cdKey] && Date.now() < player.cooldowns[cdKey]) return;

      // Determine effect based on Element & Type
      let cooldown = 1000;
      
      if (scroll.type === 'Offensive') {
          const dmg = 20 + (stats[scroll.requiredStat] * 2);
          if (scroll.element === 'Fire') {
              // Big slow fireball
              spawnProjectile(player.x, player.y, player.angle, 8, dmg * 1.5, '#f97316', 'player', 2, 'burn', 15);
              cooldown = 1500;
          } else if (scroll.element === 'Lightning') {
              // Fast pierce
              spawnProjectile(player.x, player.y, player.angle, 20, dmg, '#facc15', 'player', 5);
              cooldown = 800;
          } else {
              // Standard
              spawnProjectile(player.x, player.y, player.angle, 12, dmg, '#fff', 'player', 1);
          }
      } else if (scroll.type === 'Defensive') {
          player.shield = 100; // Max shield
          spawnFloatingText(player.x, player.y, "SHIELD UP", '#64748b');
          cooldown = 5000;
      } else if (scroll.type === 'Movement') {
          // Dash
          player.x += Math.cos(player.angle) * 100;
          player.y += Math.sin(player.angle) * 100;
          spawnParticle(player.x, player.y, '#fff', 10);
          cooldown = 2000;
      } else if (scroll.type === 'Utility') {
          // Heal
          player.hp = Math.min(player.maxHp, player.hp + 30);
          spawnFloatingText(player.x, player.y, "+30 HP", '#22c55e');
          cooldown = 8000;
      }

      player.cooldowns[cdKey] = Date.now() + cooldown;
      SoundManager.playFusionSuccess(); // Ability sound
  };

  const spawnProjectile = (x: number, y: number, angle: number, speed: number, damage: number, color: string, source: 'player'|'enemy', pierce: number = 0, effect?: any, radius: number = 5) => {
      gameState.current.projectiles.push({
          id: Date.now() + Math.random(),
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          damage, color, radius, life: 2.0, source, pierce, effect
      });
  };

  const spawnParticle = (x: number, y: number, color: string, count: number) => {
      for(let i=0; i<count; i++) {
          gameState.current.particles.push({
              id: Math.random(),
              x, y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 1.0,
              color,
              size: Math.random() * 3 + 1
          });
      }
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
      gameState.current.texts.push({
          id: Math.random(),
          x, y, text, color, life: 1.0
      });
  };

  const takeDamage = (amount: number) => {
      const player = gameState.current.player!;
      let actualDmg = amount;
      
      // Shield absorbs dmg
      if (player.shield > 0) {
          if (player.shield >= actualDmg) {
              player.shield -= actualDmg;
              actualDmg = 0;
          } else {
              actualDmg -= player.shield;
              player.shield = 0;
          }
      }

      if (actualDmg > 0) {
          player.hp -= actualDmg;
          setHp(player.hp);
          spawnFloatingText(player.x, player.y, `-${Math.floor(actualDmg)}`, '#ef4444');
          SoundManager.playMine(0.8); // Hit sound
          
          if (player.hp <= 0) {
              player.dead = true;
              setGameActive(false);
              onDeath();
          }
      }
  };

  const handleLeave = () => {
      setGameActive(false);
      onExit(gameState.current.lootBag, gameState.current.totalXp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="flex gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="text-red-500 fill-red-500" />
                        <div className="w-48 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                            <div className="h-full bg-red-600 transition-all" style={{width: `${(hp/maxHp)*100}%`}} />
                        </div>
                        <span className="text-white font-mono">{Math.floor(hp)}/{Math.floor(maxHp)}</span>
                    </div>
                    {/* Add Chi/Shield bars here if needed */}
                </div>
            </div>
            
            <div className="text-center">
                <h2 className="text-2xl font-fantasy text-red-500 tracking-widest uppercase glow-text">{biome}</h2>
                <div className="text-amber-400 font-mono">Score: {score}</div>
            </div>

            <div className="pointer-events-auto">
                <button onClick={handleLeave} className="bg-red-900/80 hover:bg-red-800 text-white px-4 py-2 rounded border border-red-500">
                    <X /> Exit Dungeon
                </button>
            </div>
        </div>

        {/* Hotbar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
            {Array.from({length: 4}).map((_, i) => {
                const scroll = equippedScrolls[i];
                return (
                    <div key={i} className={`w-16 h-16 rounded border-2 flex flex-col items-center justify-center bg-slate-900/80 relative
                        ${scroll ? 'border-cyan-500' : 'border-slate-700'}`}>
                        <div className="absolute top-1 left-1 text-xs text-slate-500 font-bold">{i+1}</div>
                        {scroll ? (
                            <>
                                <Zap className={scroll.element === 'Fire' ? 'text-orange-500' : 'text-cyan-400'} />
                                <span className="text-[10px] text-white truncate max-w-full px-1">{scroll.name}</span>
                            </>
                        ) : (
                            <span className="text-slate-600 text-xs">Empty</span>
                        )}
                    </div>
                )
            })}
        </div>

        <canvas 
            ref={canvasRef} 
            width={window.innerWidth} 
            height={window.innerHeight}
            className="cursor-crosshair"
        />
    </div>
  );
};