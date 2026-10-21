import React, { createContext, useContext, useState, useEffect } from 'react';
import { Soundscape } from '../types';
import { SOUNDSCAPES, audioManager } from '../audio/soundscapes';

interface AudioContextType {
  soundscapes: Soundscape[];
  currentSoundscape: Soundscape;
  isPlaying: boolean;
  volume: number;
  togglePlay: () => Promise<void>;
  selectSoundscape: (soundscape: Soundscape) => Promise<void>;
  setVolume: (vol: number) => Promise<void>;
  stopAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape>(SOUNDSCAPES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.7);

  const togglePlay = async () => {
    if (isPlaying) {
      await audioManager.pause();
      setIsPlaying(false);
    } else {
      const ok = await audioManager.playSoundscape(currentSoundscape, volume);
      setIsPlaying(ok);
    }
  };

  const selectSoundscape = async (scape: Soundscape) => {
    setCurrentSoundscape(scape);
    if (isPlaying) {
      const ok = await audioManager.playSoundscape(scape, volume);
      setIsPlaying(ok);
    }
  };

  const setVolume = async (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    await audioManager.setVolume(clamped);
  };

  const stopAudio = async () => {
    await audioManager.stop();
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      audioManager.stop();
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        soundscapes: SOUNDSCAPES,
        currentSoundscape,
        isPlaying,
        volume,
        togglePlay,
        selectSoundscape,
        setVolume,
        stopAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
