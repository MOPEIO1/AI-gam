import { GoogleGenAI } from "@google/genai";
import { Attribute } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FLASH = 'gemini-2.5-flash';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

// Simple cache to avoid re-generating speech for the same text in a session
const audioCache: Record<string, string> = {};

export const generateTutorialSpeech = async (text: string, voiceName: string = 'Charon'): Promise<string | null> => {
  const cacheKey = `${voiceName}:${text}`;
  if (audioCache[cacheKey]) return audioCache[cacheKey];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: {
        parts: [{ text: text }],
      },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      audioCache[cacheKey] = base64Audio;
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

export const generateCultivationLore = async (stat: Attribute, level: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Describe a brief, mystical martial arts breakthrough moment (max 2 sentences). The cultivator is training their ${stat} to reach level ${level}. Use metaphors involving nature, chi flow, or celestial bodies.`,
    });
    return response.text || "You focus your energy and feel a surge of power.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Your ${stat} increases through diligent training.`;
  }
};

export interface ExplorationResult {
  description: string;
  result: string;
  loot: {
    name: string;
    quantity: number;
    value: number;
    description: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  }[];
}

export const generateExplorationEncounter = async (biome: string): Promise<ExplorationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Generate a short RPG encounter in a ${biome}. 
      Return a strict JSON object with these fields:
      - 'description': (string) max 2 sentences describing what is found/encountered.
      - 'result': (string) a short summary of the outcome.
      - 'loot': (array) A list of items found. If nothing is found, empty array.
         - 'name': (string) Name of item (e.g. "Spirit Bamboo Shoot", "Wolf Fang").
         - 'quantity': (number) 1-5.
         - 'value': (number) estimated sell price in gold (5-500).
         - 'description': (string) short flavor text.
         - 'rarity': (string) Common, Uncommon, Rare, Epic, or Legendary.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      description: "You wander through the area but find nothing of note.",
      result: "Nothing found.",
      loot: []
    };
  }
};

export const generateAlchemyResult = async (ingredients: string[]): Promise<{ name: string; effect: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Create a mystical potion name and effect based on these ingredients: ${ingredients.join(', ')}. Return JSON with 'name' and 'effect'.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{"name": "Unknown Brew", "effect": "Nothing happens."}');
  } catch (error) {
    return { name: "Failed Concoction", effect: "It explodes in your face." };
  }
};

export const generateScrollFusion = async (scrolls: string[], chiLevel: number): Promise<{ name: string; description: string; visual: string; rank: string; synergy: string; ultimateEffect: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Combine these martial arts techniques into one: ${scrolls.map(s => `"${s}"`).join(', ')}. The user has a Chi Level of ${chiLevel}.
      Create a new, powerful combined technique.
      Return JSON format with keys:
      - "name": Cool technique name.
      - "description": Mystical description of the attack.
      - "visual": Description of visual effects (colors, particles).
      - "rank": Mortal, Earth, Heaven, or Divine.
      - "synergy": A short sentence describing the specific synergy between these elements (e.g. "Wind fans the Fire to create a vortex").
      - "ultimateEffect": Description of a hidden ability unlocked at max mastery.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Fusion Error:", error);
    return {
      name: "Unstable Fusion",
      description: "The energies clashed and fizzled out.",
      visual: "A puff of gray smoke.",
      rank: "Mortal",
      synergy: "None.",
      ultimateEffect: "None."
    };
  }
};