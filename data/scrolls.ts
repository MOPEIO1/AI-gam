import { Scroll, Attribute } from '../types';

const createScroll = (name: string, type: any, element: string, stat: Attribute, rarity: any, basePrice: number, desc: string): Omit<Scroll, 'id' | 'mastery' | 'requiredLevel'> => ({
  name,
  type,
  element,
  requiredStat: stat,
  rarity,
  price: basePrice,
  description: desc
});

// Helper to generate specific scroll data
// Note: Due to size, we are mapping the names provided to generated objects. 
// In a full production app, each would have unique descriptions manually written or stored in a DB.

const generateScrollList = () => {
  const list: Omit<Scroll, 'id' | 'mastery' | 'requiredLevel'>[] = [];

  // --- COMMON (Price ~50-100) ---
  const commons = [
    ["Iron Fist Strike", "Offensive", "Metal", Attribute.Strength],
    ["Palm Jab", "Offensive", "None", Attribute.Agility],
    ["Cinder Palm", "Offensive", "Fire", Attribute.Chi],
    ["Water Whip", "Offensive", "Water", Attribute.Chi],
    ["Gust Jab", "Offensive", "Wind", Attribute.Agility],
    ["Earth Knuckle", "Offensive", "Earth", Attribute.Strength],
    ["Ember Punch", "Offensive", "Fire", Attribute.Strength],
    ["Stone Palm", "Offensive", "Earth", Attribute.Endurance],
    ["Lightning Snap", "Offensive", "Lightning", Attribute.Chi],
    ["Shadow Strike", "Offensive", "Dark", Attribute.Agility],
    ["Turtle Shell", "Defensive", "Water", Attribute.Endurance],
    ["Earth Guard", "Defensive", "Earth", Attribute.Endurance],
    ["Water Veil", "Defensive", "Water", Attribute.Chi],
    ["Wind Wrap", "Defensive", "Wind", Attribute.Agility],
    ["Iron Skin", "Defensive", "Metal", Attribute.Endurance],
    ["Flame Guard", "Defensive", "Fire", Attribute.Chi],
    ["Mist Cloak", "Defensive", "Water", Attribute.Perception],
    ["Frost Barrier", "Defensive", "Water", Attribute.Chi],
    ["Lightning Guard", "Defensive", "Lightning", Attribute.Endurance],
    ["Shadow Ward", "Defensive", "Dark", Attribute.Perception],
    ["Step Dash", "Movement", "None", Attribute.Agility],
    ["Quick Leap", "Movement", "None", Attribute.Strength],
    ["Sliding Step", "Movement", "None", Attribute.Agility],
    ["Gale Hop", "Movement", "Wind", Attribute.Agility],
    ["Rock Hop", "Movement", "Earth", Attribute.Strength],
    ["Shadow Dash", "Movement", "Dark", Attribute.Agility],
    ["Ember Step", "Movement", "Fire", Attribute.Agility],
    ["Mist Glide", "Movement", "Water", Attribute.Chi],
    ["Lightning Blink", "Movement", "Lightning", Attribute.Chi],
    ["Water Push", "Movement", "Water", Attribute.Chi],
    ["Chi Recharge", "Utility", "None", Attribute.Chi],
    ["Focus Meditation", "Utility", "None", Attribute.Perception],
    ["Minor Healing", "Utility", "Wood", Attribute.Chi],
    ["Element Scan", "Utility", "None", Attribute.Perception],
    ["Detect Trap", "Utility", "None", Attribute.Perception],
    ["Light Orb", "Utility", "Light", Attribute.Chi],
    ["Minor Alchemy", "Utility", "None", Attribute.Perception],
    ["Sense Enemy", "Utility", "None", Attribute.Perception],
    ["Energy Pulse", "Utility", "None", Attribute.Chi],
    ["Calm Mind", "Utility", "None", Attribute.Perception]
  ];

  commons.forEach(([name, type, el, stat]) => {
    list.push(createScroll(name as string, type, el as string, stat as Attribute, 'Common', 50, `A basic ${type.toLowerCase()} scroll of the ${el} element.`));
  });

  // --- UNCOMMON (Price ~200-400) ---
  const uncommons = [
    ["Flame Palm", "Offensive", "Fire", Attribute.Strength],
    ["Water Fist", "Offensive", "Water", Attribute.Strength],
    ["Wind Jab", "Offensive", "Wind", Attribute.Agility],
    ["Rock Strike", "Offensive", "Earth", Attribute.Strength],
    ["Thunder Clap", "Offensive", "Lightning", Attribute.Chi],
    ["Shadow Punch", "Offensive", "Dark", Attribute.Agility],
    ["Ember Kick", "Offensive", "Fire", Attribute.Strength],
    ["Frost Palm", "Offensive", "Water", Attribute.Chi],
    ["Sand Palm", "Offensive", "Earth", Attribute.Agility],
    ["Gale Strike", "Offensive", "Wind", Attribute.Strength],
    ["Iron Foot", "Offensive", "Metal", Attribute.Strength],
    ["Lightning Palm", "Offensive", "Lightning", Attribute.Chi],
    ["Mud Punch", "Offensive", "Earth", Attribute.Endurance],
    ["Smoke Kick", "Offensive", "Fire", Attribute.Agility],
    ["Energy Fist", "Offensive", "None", Attribute.Chi],
    ["Stone Guard", "Defensive", "Earth", Attribute.Endurance],
    ["Wind Shield", "Defensive", "Wind", Attribute.Agility],
    ["Fire Armor", "Defensive", "Fire", Attribute.Endurance],
    ["Water Shell", "Defensive", "Water", Attribute.Endurance],
    ["Shadow Mantle", "Defensive", "Dark", Attribute.Agility],
    ["Iron Wall", "Defensive", "Metal", Attribute.Endurance],
    ["Frost Armor", "Defensive", "Water", Attribute.Endurance],
    ["Lightning Coil", "Defensive", "Lightning", Attribute.Chi],
    ["Mist Veil", "Defensive", "Water", Attribute.Perception],
    ["Ember Guard", "Defensive", "Fire", Attribute.Endurance],
    ["Cyclone Dash", "Movement", "Wind", Attribute.Agility],
    ["Rock Slide", "Movement", "Earth", Attribute.Agility],
    ["Lightning Step", "Movement", "Lightning", Attribute.Agility],
    ["Mist Step", "Movement", "Water", Attribute.Chi],
    ["Fire Vault", "Movement", "Fire", Attribute.Strength],
    ["Shadow Leap", "Movement", "Dark", Attribute.Agility],
    ["Gale Glide", "Movement", "Wind", Attribute.Agility],
    ["Earth Bound", "Movement", "Earth", Attribute.Strength],
    ["Water Step", "Movement", "Water", Attribute.Agility],
    ["Ember Hop", "Movement", "Fire", Attribute.Agility],
    ["Minor Elemental Fusion", "Utility", "None", Attribute.Chi],
    ["Healing Flow", "Utility", "Wood", Attribute.Chi],
    ["Chi Surge", "Utility", "None", Attribute.Chi],
    ["Detect Weakness", "Utility", "None", Attribute.Perception],
    ["Focus Aura", "Utility", "None", Attribute.Chi],
    ["Light Beam", "Utility", "Light", Attribute.Chi],
    ["Elemental Pulse", "Utility", "None", Attribute.Perception],
    ["Minor Summon", "Utility", "None", Attribute.Chi],
    ["Cool Mind", "Utility", "None", Attribute.Perception],
    ["Trap Disarm", "Utility", "None", Attribute.Agility],
    ["Smoke Orb", "Utility", "Fire", Attribute.Agility],
    ["Water Purge", "Utility", "Water", Attribute.Chi],
    ["Fire Spark", "Utility", "Fire", Attribute.Chi],
    ["Wind Fan", "Utility", "Wind", Attribute.Chi],
    ["Mud Wall", "Utility", "Earth", Attribute.Endurance]
  ];

  uncommons.forEach(([name, type, el, stat]) => {
    list.push(createScroll(name as string, type, el as string, stat as Attribute, 'Uncommon', 250, `A refined technique of ${el} energy.`));
  });

  // --- RARE (Price ~1000-2000) ---
  const rares = [
    ["Fire Palm Barrage", "Offensive", "Fire", Attribute.Strength],
    ["Whirlwind Kick", "Offensive", "Wind", Attribute.Agility],
    ["Stone Slam", "Offensive", "Earth", Attribute.Strength],
    ["Lightning Strike", "Offensive", "Lightning", Attribute.Chi],
    ["Shadow Flurry", "Offensive", "Dark", Attribute.Agility],
    ["Ice Shard Palm", "Offensive", "Water", Attribute.Chi],
    ["Ember Cyclone", "Offensive", "Fire", Attribute.Chi],
    ["Water Crush", "Offensive", "Water", Attribute.Strength],
    ["Gale Uppercut", "Offensive", "Wind", Attribute.Strength],
    ["Thunder Palm", "Offensive", "Lightning", Attribute.Strength],
    ["Flame Sweep", "Offensive", "Fire", Attribute.Agility],
    ["Mud Fist", "Offensive", "Earth", Attribute.Endurance],
    ["Smoke Strike", "Offensive", "Fire", Attribute.Agility],
    ["Rock Spike", "Offensive", "Earth", Attribute.Chi],
    ["Lightning Kick", "Offensive", "Lightning", Attribute.Agility],
    ["Stone Skin", "Defensive", "Earth", Attribute.Endurance],
    ["Fire Ward", "Defensive", "Fire", Attribute.Chi],
    ["Wind Cage", "Defensive", "Wind", Attribute.Chi],
    ["Water Dome", "Defensive", "Water", Attribute.Endurance],
    ["Shadow Guard", "Defensive", "Dark", Attribute.Agility],
    ["Iron Mantle", "Defensive", "Metal", Attribute.Strength],
    ["Frost Barrier", "Defensive", "Water", Attribute.Endurance],
    ["Lightning Barrier", "Defensive", "Lightning", Attribute.Chi],
    ["Ember Shell", "Defensive", "Fire", Attribute.Endurance],
    ["Mist Shroud", "Defensive", "Water", Attribute.Perception],
    ["Cyclone Step", "Movement", "Wind", Attribute.Agility],
    ["Rock Jump", "Movement", "Earth", Attribute.Strength],
    ["Lightning Dash", "Movement", "Lightning", Attribute.Agility],
    ["Mist Glide", "Movement", "Water", Attribute.Chi],
    ["Fire Vaulting", "Movement", "Fire", Attribute.Agility],
    ["Shadow Blink", "Movement", "Dark", Attribute.Chi],
    ["Gale Slide", "Movement", "Wind", Attribute.Agility],
    ["Earthbound Leap", "Movement", "Earth", Attribute.Strength],
    ["Water Walk", "Movement", "Water", Attribute.Chi],
    ["Ember Hop", "Movement", "Fire", Attribute.Agility],
    ["Elemental Fusion", "Utility", "None", Attribute.Chi],
    ["Healing Wave", "Utility", "Wood", Attribute.Chi],
    ["Chi Overcharge", "Utility", "None", Attribute.Chi],
    ["Detect Secrets", "Utility", "None", Attribute.Perception],
    ["Focus Aura II", "Utility", "None", Attribute.Chi],
    ["Light Sphere", "Utility", "Light", Attribute.Chi],
    ["Elemental Scan", "Utility", "None", Attribute.Perception],
    ["Summon Elemental", "Utility", "None", Attribute.Chi],
    ["Cool Mind II", "Utility", "None", Attribute.Perception],
    ["Trap Nullifier", "Utility", "None", Attribute.Agility],
    ["Smoke Screen", "Utility", "Fire", Attribute.Agility],
    ["Water Purge II", "Utility", "Water", Attribute.Chi],
    ["Fire Spark II", "Utility", "Fire", Attribute.Chi],
    ["Wind Blast", "Utility", "Wind", Attribute.Strength],
    ["Mud Wall II", "Utility", "Earth", Attribute.Endurance]
  ];

  rares.forEach(([name, type, el, stat]) => {
    list.push(createScroll(name as string, type, el as string, stat as Attribute, 'Rare', 1500, `A potent ${name} technique used by experts.`));
  });

  // --- EPIC (Price ~5000-8000) ---
  const epics = [
    ["Inferno Palm", "Offensive", "Fire", Attribute.Chi],
    ["Tsunami Strike", "Offensive", "Water", Attribute.Strength],
    ["Tempest Kick", "Offensive", "Wind", Attribute.Agility],
    ["Earthquake Slam", "Offensive", "Earth", Attribute.Strength],
    ["Thunderstorm Palm", "Offensive", "Lightning", Attribute.Chi],
    ["Shadow Blade Strike", "Offensive", "Dark", Attribute.Agility],
    ["Frost Cyclone", "Offensive", "Water", Attribute.Chi],
    ["Ember Nova", "Offensive", "Fire", Attribute.Chi],
    ["Gale Fury", "Offensive", "Wind", Attribute.Agility],
    ["Lava Fist", "Offensive", "Fire", Attribute.Strength],
    ["Storm Kick", "Offensive", "Lightning", Attribute.Agility],
    ["Shadow Flare", "Offensive", "Dark", Attribute.Chi],
    ["Ice Spike Volley", "Offensive", "Water", Attribute.Chi],
    ["Magma Palm", "Offensive", "Fire", Attribute.Strength],
    ["Lightning Whirl", "Offensive", "Lightning", Attribute.Agility],
    ["Obsidian Skin", "Defensive", "Earth", Attribute.Endurance],
    ["Storm Guard", "Defensive", "Wind", Attribute.Endurance],
    ["Eternal Stone", "Defensive", "Earth", Attribute.Endurance],
    ["Water Shield II", "Defensive", "Water", Attribute.Chi],
    ["Shadow Mantle II", "Defensive", "Dark", Attribute.Agility],
    ["Inferno Guard", "Defensive", "Fire", Attribute.Chi],
    ["Frost Aegis", "Defensive", "Water", Attribute.Endurance],
    ["Lightning Ward", "Defensive", "Lightning", Attribute.Chi],
    ["Ember Barrier", "Defensive", "Fire", Attribute.Chi],
    ["Mist Cloak II", "Defensive", "Water", Attribute.Perception],
    ["Cyclone Rush", "Movement", "Wind", Attribute.Agility],
    ["Earth Spire Leap", "Movement", "Earth", Attribute.Strength],
    ["Lightning Surge", "Movement", "Lightning", Attribute.Agility],
    ["Mist Walk", "Movement", "Water", Attribute.Chi],
    ["Fire Leap II", "Movement", "Fire", Attribute.Strength],
    ["Shadow Warp", "Movement", "Dark", Attribute.Chi],
    ["Gale Sprint", "Movement", "Wind", Attribute.Agility],
    ["Rock Slam Leap", "Movement", "Earth", Attribute.Strength],
    ["Water Surf", "Movement", "Water", Attribute.Agility],
    ["Ember Vault", "Movement", "Fire", Attribute.Agility],
    ["Elemental Fusion II", "Utility", "None", Attribute.Chi],
    ["Healing Wave II", "Utility", "Wood", Attribute.Chi],
    ["Chi Overcharge II", "Utility", "None", Attribute.Chi],
    ["Detect Secrets II", "Utility", "None", Attribute.Perception],
    ["Focus Aura III", "Utility", "None", Attribute.Chi],
    ["Radiant Light Sphere", "Utility", "Light", Attribute.Chi],
    ["Elemental Scan II", "Utility", "None", Attribute.Perception],
    ["Summon Greater Elemental", "Utility", "None", Attribute.Chi],
    ["Cool Mind III", "Utility", "None", Attribute.Perception],
    ["Trap Nullifier II", "Utility", "None", Attribute.Agility],
    ["Smoke Screen II", "Utility", "Fire", Attribute.Agility],
    ["Water Purge III", "Utility", "Water", Attribute.Chi],
    ["Fire Spark III", "Utility", "Fire", Attribute.Chi],
    ["Wind Tempest", "Utility", "Wind", Attribute.Chi],
    ["Mud Wall III", "Utility", "Earth", Attribute.Endurance]
  ];

  epics.forEach(([name, type, el, stat]) => {
    list.push(createScroll(name as string, type, el as string, stat as Attribute, 'Epic', 6000, `An incredible display of power, the ${name} is feared by many.`));
  });

  // --- LEGENDARY (Price ~25000+) ---
  const legendaries = [
    ["Infernal Cyclone", "Offensive", "Fire", Attribute.Chi],
    ["Leviathan Strike", "Offensive", "Water", Attribute.Strength],
    ["Gale Maelstrom", "Offensive", "Wind", Attribute.Agility],
    ["Cataclysm Slam", "Offensive", "Earth", Attribute.Strength],
    ["Thunder Cataclysm", "Offensive", "Lightning", Attribute.Chi],
    ["Shadow Reaper", "Offensive", "Dark", Attribute.Agility],
    ["Absolute Frost", "Offensive", "Water", Attribute.Chi],
    ["Magma Nova", "Offensive", "Fire", Attribute.Chi],
    ["Tempest Inferno", "Offensive", "Fire", Attribute.Chi],
    ["Tectonic Crush", "Offensive", "Earth", Attribute.Strength],
    ["Lightning Vortex", "Offensive", "Lightning", Attribute.Chi],
    ["Ember Inferno", "Offensive", "Fire", Attribute.Chi],
    ["Shadow Tempest", "Offensive", "Dark", Attribute.Chi],
    ["Frost Nova", "Offensive", "Water", Attribute.Chi],
    ["Inferno Fist", "Offensive", "Fire", Attribute.Strength],
    ["Storm Fury", "Offensive", "Wind", Attribute.Agility],
    ["Shadow Cyclone", "Offensive", "Dark", Attribute.Agility],
    ["Ice Spike Barrage", "Offensive", "Water", Attribute.Chi],
    ["Lava Tsunami", "Offensive", "Fire", Attribute.Chi],
    ["Lightning Tempest", "Offensive", "Lightning", Attribute.Chi],
    ["Eternal Obsidian", "Defensive", "Earth", Attribute.Endurance],
    ["Storm Mantle", "Defensive", "Wind", Attribute.Endurance],
    ["Elemental Aegis", "Defensive", "None", Attribute.Chi],
    ["Inferno Ward", "Defensive", "Fire", Attribute.Endurance],
    ["Frost Bastion", "Defensive", "Water", Attribute.Endurance],
    ["Shadow Fortress", "Defensive", "Dark", Attribute.Chi],
    ["Lightning Reflection", "Defensive", "Lightning", Attribute.Agility],
    ["Ember Aegis", "Defensive", "Fire", Attribute.Chi],
    ["Mist Fortress", "Defensive", "Water", Attribute.Chi],
    ["Earth Colossus", "Defensive", "Earth", Attribute.Endurance],
    ["Cyclone Surge II", "Movement", "Wind", Attribute.Agility],
    ["Earthquake Leap", "Movement", "Earth", Attribute.Strength],
    ["Lightning Warp", "Movement", "Lightning", Attribute.Chi],
    ["Mist Glide II", "Movement", "Water", Attribute.Chi],
    ["Fire Catapult", "Movement", "Fire", Attribute.Strength],
    ["Shadow Rift", "Movement", "Dark", Attribute.Chi],
    ["Gale Sprint II", "Movement", "Wind", Attribute.Agility],
    ["Rock Avalanche", "Movement", "Earth", Attribute.Strength],
    ["Water Tsunami", "Movement", "Water", Attribute.Agility],
    ["Ember Ascension", "Movement", "Fire", Attribute.Chi],
    ["Elemental Fusion III", "Utility", "None", Attribute.Chi],
    ["Healing Tempest", "Utility", "Wood", Attribute.Chi],
    ["Chi Overcharge III", "Utility", "None", Attribute.Chi],
    ["Detect Arcana", "Utility", "None", Attribute.Perception],
    ["Focus Aura IV", "Utility", "None", Attribute.Chi],
    ["Radiant Nova", "Utility", "Light", Attribute.Chi],
    ["Elemental Scan III", "Utility", "None", Attribute.Perception],
    ["Summon Legendary Elemental", "Utility", "None", Attribute.Chi],
    ["Cool Mind IV", "Utility", "None", Attribute.Perception],
    ["Trap Nullifier III", "Utility", "None", Attribute.Agility],
    ["Smoke Tempest", "Utility", "Fire", Attribute.Agility],
    ["Water Purge IV", "Utility", "Water", Attribute.Chi],
    ["Firestorm", "Utility", "Fire", Attribute.Chi],
    ["Wind Cataclysm", "Utility", "Wind", Attribute.Chi],
    ["Mud Fortress", "Utility", "Earth", Attribute.Endurance],
    ["Chi Resonance", "Utility", "None", Attribute.Chi],
    ["Spirit Link", "Utility", "None", Attribute.Chi],
    ["Shadow Veil", "Utility", "Dark", Attribute.Agility],
    ["Infernal Fusion", "Utility", "Fire", Attribute.Chi],
    ["Temporal Scan", "Utility", "Time", Attribute.Perception]
  ];

  legendaries.forEach(([name, type, el, stat]) => {
    list.push(createScroll(name as string, type, el as string, stat as Attribute, 'Legendary', 30000, `A legendary lost art. The ${name} shakes the foundations of the world.`));
  });

  return list;
};

export const MASTER_SCROLL_LIST = generateScrollList();