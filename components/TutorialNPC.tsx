import React, { useEffect, useState, useRef } from 'react';
import { X, Sparkles, Scroll as ScrollIcon, Volume2, Loader2, Play } from 'lucide-react';
import { Button } from './Button';
import { generateTutorialSpeech } from '../services/geminiService';
import { SoundManager } from '../utils/SoundManager';
import { GuideProfile } from '../types';

interface Props {
  message: string;
  onNext?: () => void;
  onClose: () => void;
  actionRequired?: boolean;
  isDemonstrating?: boolean;
  canDismiss?: boolean;
  guide: GuideProfile;
}

export const TutorialNPC: React.FC<Props> = ({ 
  message, 
  onNext, 
  onClose, 
  actionRequired = false,
  isDemonstrating = false,
  canDismiss = false,
  guide
}) => {
  const [visible, setVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const lastSpokenMessage = useRef<string>("");
  const typeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // New message arrived
    if (message !== lastSpokenMessage.current) {
        lastSpokenMessage.current = message;
        setVisible(true);
        setDisplayedText(""); // Clear text initially
        setIsTyping(false);
        handleSpeak(message);
    }
  }, [message]);

  const startTypewriter = (text: string) => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    
    setIsTyping(true);
    let i = 0;
    // Fast typing to match spoken word pace
    typeIntervalRef.current = window.setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      }
    }, 30);
  };

  const handleSpeak = async (textToSpeak: string = message) => {
    if (isLoadingAudio) return;
    
    SoundManager.init(); 
    setIsLoadingAudio(true);
    setIsPlayingAudio(false);
    setDisplayedText(""); // Keep empty while loading
    
    // Fetch audio first
    const audioData = await generateTutorialSpeech(textToSpeak, guide.voiceName);
    
    setIsLoadingAudio(false);
    
    if (audioData) {
      // Start visual and audio at the same frame roughly
      startTypewriter(textToSpeak);
      setIsPlayingAudio(true);
      const duration = await SoundManager.playVoiceData(audioData, guide.speechRate);
      setTimeout(() => setIsPlayingAudio(false), duration * 1000);
    } else {
      // Fallback if audio fails
      startTypewriter(textToSpeak);
    }
  };

  useEffect(() => {
      return () => {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      }
  }, []);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 pointer-events-none transition-all duration-500 flex items-end justify-center md:justify-end md:pr-10 md:pb-10 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      
      <div className="relative flex flex-col md:flex-row items-end gap-4 w-full max-w-4xl mx-auto md:mx-0">
        
        {/* Character Portrait (Cut-in Style) */}
        <div className="relative z-20 pointer-events-auto group hidden md:block">
           <div className={`w-64 h-80 relative overflow-hidden rounded-t-xl transition-all duration-300 ${isPlayingAudio ? 'scale-[1.02] brightness-110' : 'scale-100 brightness-90'}`}>
              {/* Image with gradient mask at bottom */}
              <img 
                src={guide.portraitUrl} 
                alt={guide.name}
                className="w-full h-full object-cover object-top"
                style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
              />
              
              {/* Inner Glow / Status */}
              <div className={`absolute inset-0 border-2 rounded-t-xl border-b-0 transition-colors ${isPlayingAudio ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-slate-600/30'}`} />
              
              {isDemonstrating && (
                 <div className="absolute top-4 right-4 animate-pulse">
                    <Sparkles className="text-yellow-400 drop-shadow-lg" size={24} />
                 </div>
              )}
           </div>
           
           {/* Name Plate */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 px-4 py-1 rounded text-center shadow-xl w-4/5 backdrop-blur-md">
              <div className={`font-fantasy font-bold text-sm ${guide.color}`}>{guide.name}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{guide.race}</div>
           </div>
        </div>

        {/* Mobile Portrait (Smaller Bubble) */}
        <div className="md:hidden relative z-20 mx-auto pointer-events-auto" onClick={() => !isLoadingAudio && handleSpeak()}>
            <div className={`w-20 h-20 rounded-full border-2 overflow-hidden bg-slate-900 relative shadow-xl ${isPlayingAudio ? 'border-cyan-400 animate-pulse' : 'border-amber-500'}`}>
               <img src={guide.portraitUrl} className="w-full h-full object-cover" alt={guide.name} />
            </div>
        </div>

        {/* Dialogue Box */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-6 rounded-t-2xl md:rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex-1 min-h-[160px] relative pointer-events-auto w-full md:w-auto animate-in slide-in-from-bottom-5">
            
            {/* Audio Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button 
                    onClick={() => !isLoadingAudio && handleSpeak()}
                    disabled={isLoadingAudio || isPlayingAudio}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-50"
                >
                    {isLoadingAudio ? <Loader2 className="animate-spin" size={14} /> : isPlayingAudio ? <Volume2 className="animate-pulse" size={14} /> : <Play size={14} />}
                </button>
                {canDismiss && (
                    <button onClick={onClose} className="text-slate-600 hover:text-slate-400">
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="mb-4">
                <h4 className={`font-fantasy text-lg md:hidden ${guide.color}`}>{guide.name}</h4>
                <div className="h-px w-12 bg-gradient-to-r from-cyan-500 to-transparent mt-1 mb-2 md:hidden" />
            </div>

            <div className="text-slate-200 text-lg font-serif leading-relaxed min-h-[3rem] pr-8">
                {isLoadingAudio ? (
                    <span className="text-slate-500 animate-pulse text-sm">Thinking...</span>
                ) : (
                    <>
                        <span className="text-slate-500">"</span>
                        {displayedText}
                        {isTyping && <span className="animate-pulse ml-1">|</span>}
                        <span className="text-slate-500">"</span>
                    </>
                )}
            </div>

            <div className="mt-4 flex justify-between items-center border-t border-slate-800 pt-3">
               <div className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
                  {actionRequired ? "Waiting for Action..." : "Press Continue"}
               </div>
               
               {!actionRequired && onNext && (
                  <Button 
                    variant="secondary" 
                    onClick={onNext} 
                    className="text-sm px-6 py-2 border-amber-500/30 hover:bg-amber-900/20 text-amber-100 font-fantasy tracking-wider"
                    disabled={isTyping || isLoadingAudio}
                  >
                    Continue <ScrollIcon className="w-4 h-4 ml-2" />
                  </Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};